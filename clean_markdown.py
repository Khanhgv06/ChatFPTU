import os
from bs4 import BeautifulSoup
from markdown import markdown
from pathlib import Path

def clean_markdown(text):
    html = markdown(text)
    soup = BeautifulSoup(html, 'html.parser')
    return soup.get_text()

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    cleaned = clean_markdown(content)
    
    with open(file_path.rstrip(".md") + ".txt", 'w', encoding='utf-8') as f:
        f.write(cleaned)

def main():
    root_dir = Path('.')
    for md_file in root_dir.rglob('*.md'):
        print(f"Cleaning {md_file}")
        process_file(md_file)

if __name__ == '__main__':
    main()
