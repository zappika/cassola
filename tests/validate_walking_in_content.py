"""Validate draft content structure, not language correctness or evaluator behavior."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
lesson = json.loads((ROOT / 'content/walking-in.v2.json').read_text())
fixtures = json.loads((ROOT / 'tests/fixtures/walking-in.v2.answers.json').read_text())


def require(condition, message):
    if not condition:
        raise ValueError(message)


def index(items, label):
    result = {item['id']: item for item in items}
    require(len(result) == len(items), f'Duplicate {label} ID')
    return result


def bilingual(value):
    require(all(isinstance(value.get(k), str) and value[k].strip() for k in ('ca', 'en')), 'Missing bilingual text')


situations = index(lesson['situations'], 'situation')
rules = index(lesson['answer_rules'], 'rule')
exercises = index(lesson['exercises'], 'exercise')
branches = index(lesson['branches'], 'branch')
audio = lesson['audio']
outcomes = {'communicated', 'needs_information', 'different_meaning', 'uncertain'}
require(lesson['schema_version'] == 2, 'Wrong schema')
require(lesson['review']['status'] == 'awaiting_native_review', 'Draft must not claim review')
require(fixtures['content_version'] == lesson['content_version'], 'Stale fixtures')
require(len(exercises) == 10 and len(branches) == 3, 'Incomplete lesson flow')
require({e['type'] for e in exercises.values()} == {'listen_choice', 'choice', 'build', 'type', 'speak', 'exchange'}, 'Missing modality')
for s in situations.values():
    bilingual(s['context'])
    require(s['facts']['party_size'] > 0, 'Invalid party size')
for r in rules.values():
    bilingual(r['goal']); bilingual(r['hint'])
    require(r['required_details'] and len(r['accepted_responses']) >= 2, 'Missing rule examples/details')
    require(r['model_audio_id'] in audio, 'Missing model audio')
    for key in r['required_details']:
        require(key in lesson['feedback']['missing_details'], f'Missing feedback for {key}')
for e in exercises.values():
    require(e['situation_id'] in situations and e['rule_id'] in rules, 'Broken exercise reference')
    for value in rules[e['rule_id']]['required_details'].values():
        if isinstance(value, str) and value.startswith('$'):
            require(situations[e['situation_id']]['facts'].get(value[1:]) is not None, 'Unresolved fact')
    if 'options' in e:
        index(e['options'], 'option')
        require(any(o['expected_outcome'] == 'communicated' for o in e['options']), 'No successful choice')
        require(any(o['expected_outcome'] != 'communicated' for o in e['options']), 'No contrasting choice')
        for o in e['options']:
            bilingual(o['text'])
            require(o['expected_outcome'] in outcomes, 'Bad option outcome')
            require(set(o['missing_details']) <= rules[e['rule_id']]['required_details'].keys(), 'Unknown missing detail')
    if 'chunks' in e:
        chunks = index(e['chunks'], 'chunk')
        require(len(e['accepted_chunk_sequences']) >= 2, 'Need alternate builds')
        for sequence in e['accepted_chunk_sequences']:
            require(set(sequence) <= chunks.keys() and len(sequence) == len(set(sequence)), 'Invalid chunk sequence')
    for task in e.get('tasks', []):
        require(task['rule_id'] in rules, 'Missing speaking rule')
    for bid in e.get('branch_ids', []):
        require(bid in branches, 'Missing final branch')
for note in lesson['teaching_notes']:
    require(note['before_exercise'] in exercises, 'Broken teaching note target')
    bilingual(note['text'])
for b in branches.values():
    require(b['situation_id'] in situations, 'Missing branch situation')
    nodes = index(b['nodes'], 'node')
    require(3 <= len(nodes) <= 5, 'Branch length')
    cursor = b['entry_node']; visited = set()
    while cursor != 'complete':
        require(cursor in nodes and cursor not in visited, 'Broken/cyclic success path')
        visited.add(cursor)
        n = nodes[cursor]
        require(n['rule_id'] in rules, 'Missing node rule')
        require(all('on_' + o in n for o in outcomes), 'Missing outcome transition')
        require(n['on_repeat'] == 'replay_current_staff_without_advancing', 'Missing recovery')
        cursor = n['on_communicated']
    require(visited == nodes.keys(), 'Unreachable node')


def walk(value):
    if isinstance(value, dict):
        if 'audio_id' in value:
            require(value['audio_id'] in audio, 'Broken audio reference')
            if 'ca' in value:
                require(value['ca'] == audio[value['audio_id']]['text'], 'Audio text mismatch')
        for child in value.values(): walk(child)
    elif isinstance(value, list):
        for child in value: walk(child)


walk(lesson)
require(all(a['src'] is None and a['status'] == 'not_generated' for a in audio.values()), 'Unexpected generated asset')
cases = index(fixtures['answer_cases'], 'fixture')
for rid in rules:
    require({c['expected']['outcome'] for c in cases.values() if c['rule_id'] == rid} == outcomes, f'Incomplete outcome coverage: {rid}')
for c in cases.values():
    require(c['rule_id'] in rules and c['situation_id'] in situations, 'Broken fixture reference')
    expected = c['expected']
    require(set(expected['missing_details']) <= rules[c['rule_id']]['required_details'].keys(), 'Invalid expected missing details')
    require(bool(expected['missing_details']) == (expected['outcome'] == 'needs_information'), 'Inconsistent missing outcome')
require({c['branch_id'] for c in fixtures['branch_cases']} == branches.keys(), 'Missing branch fixture')
for c in fixtures['branch_cases']:
    b = branches[c['branch_id']]; nodes = index(b['nodes'], 'node'); cursor = b['entry_node']
    for turn in c['turns']:
        require(turn['node_id'] == cursor, 'Fixture skips node')
        require(turn['expected_next'] == nodes[cursor]['on_communicated'], 'Wrong expected transition')
        cursor = turn['expected_next']
    require(cursor == 'complete', 'Incomplete branch fixture')
print(f'PASS: {len(exercises)} exercises, {len(branches)} branches, {len(rules)} rules, {len(audio)} audio placeholders; {len(cases)} answer expectations, 3 branch paths, {len(fixtures["behavior_cases"])} behavior specifications.')
print('Structural validation only; run npm run test:lesson for evaluator checks. Native review remains pending.')
