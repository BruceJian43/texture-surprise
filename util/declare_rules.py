import argparse
import dataclasses
import json


@dataclasses.dataclass
class Rule:
    id: int
    priority: int
    action: dict
    condition: dict


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='./rules.json')
    args = parser.parse_args()

    targets = [20, 24, 32, 40, 48, 88, 96, 176]
    rules = [
        dataclasses.asdict(
            Rule(i + 1, i + 1, {'type': "block"},
                 {'urlFilter': f'*://miro.medium.com/fit/c/{target}'}))
        for i, target in enumerate(targets)
    ]

    with open(args.output, 'w') as f:
        json.dump(rules, f, indent=2)
