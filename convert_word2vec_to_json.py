import os
import json
import numpy as np
from gensim.models import Word2Vec
import re
import argparse
import struct

EMBEDDINGS_DIR = 'public'
OUTPUT_DIR = 'public/embeddings'

os.makedirs(OUTPUT_DIR, exist_ok=True)

def convert_model(year):
    model_path = os.path.join(EMBEDDINGS_DIR, f'word2vec_articles_{year}.model')
    if not os.path.exists(model_path):
        print(f"Model for {year} not found, skipping.")
        return
    print(f"Loading model for {year}...")
    model = Word2Vec.load(model_path)
    vocab = list(model.wv.index_to_key)
    vectors = model.wv.vectors
    # Convert to dict: word -> vector (as list)
    word_vectors = {word: vectors[i].tolist() for i, word in enumerate(vocab)}
    out_path = os.path.join(OUTPUT_DIR, f'{year}.json')
    print(f"Saving {out_path}...")
    with open(out_path, 'w') as f:
        json.dump({
            'year': year,
            'vocab': vocab,
            'vectors': word_vectors
        }, f)

def build_index():
    index = []
    year_file_pattern = re.compile(r'^(\d{4})\.json$')
    for fname in os.listdir(OUTPUT_DIR):
        match = year_file_pattern.match(fname)
        if match:
            year = int(match.group(1))
            fpath = os.path.join(OUTPUT_DIR, fname)
            with open(fpath, 'r') as f:
                data = json.load(f)
                index.append({
                    'year': year,
                    'vocab': data['vocab']
                })
    # Sort by year ascending
    index.sort(key=lambda x: x['year'])
    index_path = os.path.join(OUTPUT_DIR, 'index.json')
    print(f"Saving {index_path}...")
    with open(index_path, 'w') as f:
        json.dump(index, f, separators=(',', ':'))

def build_global_vocab(embeddings_dir, output_vocab_path):
    """
    Scan all yearly embedding JSON files in embeddings_dir,
    collect all unique words (from 'vectors' key if present), and write them as a sorted list to output_vocab_path.
    """
    vocab_set = set()
    for fname in os.listdir(embeddings_dir):
        if fname.endswith('.json') and fname != 'vocab_intersection.json' and fname != 'index.json':
            with open(os.path.join(embeddings_dir, fname), 'r') as f:
                data = json.load(f)
                # If 'vectors' key exists, use it
                if isinstance(data, dict) and 'vectors' in data:
                    vectors = data['vectors']
                    if isinstance(vectors, dict):
                        vocab_set.update(vectors.keys())
                elif isinstance(data, dict):
                    vocab_set.update(data.keys())
                elif isinstance(data, list):
                    for entry in data:
                        if isinstance(entry, dict):
                            vocab_set.update(entry.keys())
    vocab_list = sorted(vocab_set)
    with open(output_vocab_path, 'w') as f:
        json.dump(vocab_list, f, ensure_ascii=False, indent=2)

def build_yearly_binaries(embeddings_dir, vocab_path, output_dir):
    """
    For each yearly embedding JSON, write a binary file with:
    - 4 bytes: magic number (b'EMBD')
    - 2 bytes: vector dimension (uint16)
    - 4 bytes: number of words (uint32)
    - For each word:
        - 4 bytes: word index (uint32)
        - (4 * dim) bytes: vector (float32 array)
    """
    with open(vocab_path, 'r') as f:
        vocab = json.load(f)
    word_to_index = {w: i for i, w in enumerate(vocab)}
    for fname in os.listdir(embeddings_dir):
        if fname.endswith('.json') and fname != 'vocab_intersection.json' and fname != 'index.json' and fname != 'vocab.json':
            year = fname.split('.')[0]
            with open(os.path.join(embeddings_dir, fname), 'r') as f:
                data = json.load(f)
            # If 'vectors' key exists, use it
            if isinstance(data, dict) and 'vectors' in data:
                data = data['vectors']
            print(f"First 10 keys in {fname}: {list(data.keys())[:10]}")
            if not data:
                continue
            valid_items = []
            for word, vec in data.items():
                if not isinstance(vec, list):
                    print(f"Warning: Skipping {word} in {fname} (not a list)")
                    continue
                if not all(isinstance(x, (float, int)) for x in vec):
                    print(f"Warning: Skipping {word} in {fname} (non-numeric values)")
                    continue
                if len(vec) == 0:
                    print(f"Warning: Skipping {word} in {fname} (empty vector)")
                    continue
                valid_items.append((word, vec))
            if not valid_items:
                print(f"Warning: No valid vectors in {fname}")
                continue
            first_vec = valid_items[0][1]
            dim = len(first_vec)
            valid_items = [(word, vec) for word, vec in valid_items if len(vec) == dim]
            outpath = os.path.join(output_dir, f'embeddings_{year}.bin')
            with open(outpath, 'wb') as fout:
                fout.write(b'EMBD')  # magic
                fout.write(struct.pack('<H', dim))
                fout.write(struct.pack('<I', len(valid_items)))
                for word, vec in valid_items:
                    idx = word_to_index[word]
                    fout.write(struct.pack('<I', idx))
                    fout.write(struct.pack(f'<{dim}f', *[float(x) for x in vec]))

def main():
    parser = argparse.ArgumentParser(description="Embedding utilities")
    parser.add_argument('--build-vocab', action='store_true', help='Build global vocab from yearly embedding JSONs')
    parser.add_argument('--build-binaries', action='store_true', help='Build per-year binary embedding files')
    args = parser.parse_args()

    if args.build_vocab:
        embeddings_dir = os.path.join(os.path.dirname(__file__), 'public', 'embeddings')
        output_vocab_path = os.path.join(embeddings_dir, 'vocab.json')
        build_global_vocab(embeddings_dir, output_vocab_path)
    elif args.build_binaries:
        embeddings_dir = os.path.join(os.path.dirname(__file__), 'public', 'embeddings')
        vocab_path = os.path.join(embeddings_dir, 'vocab.json')
        output_dir = embeddings_dir
        build_yearly_binaries(embeddings_dir, vocab_path, output_dir)
    else:
        build_index()

if __name__ == '__main__':
    main() 