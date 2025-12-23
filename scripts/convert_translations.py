#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert legacy PHP language JSON files to Odoo PO translation files.

Usage:
    python convert_translations.py <input_json> <output_po> <lang_code>
    
Example:
    python convert_translations.py legacy-php/languages/french.json \
        custom_addons/seitech_elearning/i18n/fr.po fr
"""
import json
import sys
import os
from datetime import datetime


def json_to_po(json_file, po_file, lang_code):
    """Convert a JSON language file to Odoo PO format."""
    
    # Read JSON file
    with open(json_file, 'r', encoding='utf-8') as f:
        translations = json.load(f)
    
    # PO file header
    header = f'''# Translation file for Seitech E-Learning
# Converted from legacy PHP application
# Copyright (C) {datetime.now().year} Seitech International
# This file is distributed under the LGPL-3 license.
#
msgid ""
msgstr ""
"Project-Id-Version: Seitech E-Learning 19.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}+0000\\n"
"PO-Revision-Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}+0000\\n"
"Last-Translator: \\n"
"Language-Team: \\n"
"Language: {lang_code}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

'''
    
    # Write PO file
    with open(po_file, 'w', encoding='utf-8') as f:
        f.write(header)
        
        for key, value in translations.items():
            if not key or value is None:
                continue
            
            # Convert key to readable English (replace underscores, capitalize)
            english_text = key.replace('_', ' ').capitalize()
            
            # Escape special characters
            english_text = english_text.replace('\\', '\\\\').replace('"', '\\"')
            value = str(value).replace('\\', '\\\\').replace('"', '\\"')
            
            # Write entry
            f.write(f'#. Legacy key: {key}\n')
            f.write(f'msgid "{english_text}"\n')
            f.write(f'msgstr "{value}"\n\n')
    
    print(f"Converted {len(translations)} translations to {po_file}")


# Mapping of JSON file names to language codes
LANGUAGE_MAP = {
    'arabic.json': 'ar',
    'chinese.json': 'zh_CN',
    'english.json': 'en',
    'french.json': 'fr',
    'georgian.json': 'ka',
    'german.json': 'de',
    'hindi.json': 'hi',
    'indonesia.json': 'id',
    'italian.json': 'it',
    'khmer.json': 'km',
    'portuguese.json': 'pt',
    'romanian.json': 'ro',
    'russian.json': 'ru',
    'spanish.json': 'es',
    'turkish.json': 'tr',
    'urdu.json': 'ur',
}


def convert_all_languages(source_dir, output_dir):
    """Convert all JSON language files to PO format."""
    os.makedirs(output_dir, exist_ok=True)
    
    for json_file, lang_code in LANGUAGE_MAP.items():
        json_path = os.path.join(source_dir, json_file)
        if os.path.exists(json_path):
            po_path = os.path.join(output_dir, f'{lang_code}.po')
            try:
                json_to_po(json_path, po_path, lang_code)
            except Exception as e:
                print(f"Error converting {json_file}: {e}")
        else:
            print(f"Warning: {json_path} not found")


if __name__ == '__main__':
    if len(sys.argv) == 4:
        # Single file conversion
        json_to_po(sys.argv[1], sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 3:
        # Convert all languages
        convert_all_languages(sys.argv[1], sys.argv[2])
    else:
        print(__doc__)
        print("\nTo convert all languages:")
        print("  python convert_translations.py legacy-php/languages/ custom_addons/seitech_elearning/i18n/")
