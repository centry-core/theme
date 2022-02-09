from pylon.core.tools import log
from bs4 import BeautifulSoup


def tag_format(tags):
    badge_classes = {
        'badge-primary': 0,
        'badge-secondary': 0,
        'badge-success': 0,
        'badge-danger': 0,
        'badge-warning': 0,
        'badge-info': 0,
        'badge-light': 0,
        'badge-dark': 0,
    }
    tag_badge_mapping = dict()

    result = []
    for tag in tags:
        chosen_class = tag_badge_mapping.get(tag, sorted(badge_classes, key=badge_classes.get)[0])
        badge_classes[chosen_class] += 1
        tag_badge_mapping[tag] = chosen_class
        result.append(f'<span class="badge mr-1 {chosen_class}">{tag}</span>')

    return ''.join(result)


def extract_tags(markup, tags: list = ['script', 'style']):
    soup = BeautifulSoup(markup, 'html.parser')
    extracted = [s.extract() for s in soup(tags)]
    return str(soup), ''.join(map(str, extracted))
