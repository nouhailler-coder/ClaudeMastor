import json
import os

def write_ts_domain(filepath, domain_id, domain_code, domain_title, cards):
    lines = [
        "import { Flashcard } from '../../types';",
        "",
        f"export const DOMAIN_{domain_id}_FLASHCARDS: Flashcard[] = ["
    ]
    for c in cards:
        lines.append("  {")
        lines.append(f"    id: {c['id']},")
        lines.append(f"    domainId: {domain_id},")
        lines.append(f"    domainCode: '{domain_code}',")
        lines.append(f"    domainTitle: '{domain_title}',")
        lines.append(f"    topic: {json.dumps(c['topic'], ensure_ascii=False)},")
        lines.append(f"    question: {json.dumps(c['question'], ensure_ascii=False)},")
        lines.append(f"    answerTitle: {json.dumps(c['answerTitle'], ensure_ascii=False)},")
        bullets_str = json.dumps(c['answerBullets'], ensure_ascii=False, indent=6)
        lines.append(f"    answerBullets: {bullets_str},")
        lines.append(f"    keyTakeaway: {json.dumps(c['keyTakeaway'], ensure_ascii=False)},")
        lines.append(f"    docRef: {json.dumps(c['docRef'], ensure_ascii=False)},")
        lines.append(f"    difficulty: '{c['difficulty']}',")
        if 'relatedArticleId' in c:
            lines.append(f"    relatedArticleId: '{c['relatedArticleId']}',")
        lines.append("  },")
    lines.append("];")
    lines.append("")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Generated {len(cards)} cards in {filepath}")

# Load existing 20 cards for each domain if present to preserve their hand-crafted perfection
def extract_existing_cards(domain_num):
    filepath = f"src/data/flashcards/domain{domain_num}.ts"
    existing = []
    if os.path.exists(filepath):
        # We can extract them or load from previous data
        pass
    return existing

print("Master script setup")
