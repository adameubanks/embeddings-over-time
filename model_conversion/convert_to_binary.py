#!/usr/bin/env python3
"""
Convert JSON embedding files to compact binary format.
This will reduce file sizes by ~75% and improve loading speed.
"""

import json
import struct
import numpy as np
from pathlib import Path

def convert_json_to_binary(json_path, binary_path):
    """Convert a single JSON file to binary format."""
    print(f"Converting {json_path} to binary...")
    
    # Load JSON data
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    # Extract metadata
    vocab = data['vocab']
    vectors = data['vectors']
    dimension = data['dimension']
    vocab_size = data['vocab_size']
    
    # Create binary file
    with open(binary_path, 'wb') as f:
        # Write header: vocab_size (4 bytes), dimension (4 bytes)
        f.write(struct.pack('<II', vocab_size, dimension))
        
        # Write vocabulary as null-terminated strings
        for word in vocab:
            f.write(word.encode('utf-8') + b'\x00')
        
        # Write vectors as float32 array
        for word in vocab:
            vector = vectors[word]
            # Convert to float32 and write
            vector_array = np.array(vector, dtype=np.float32)
            f.write(vector_array.tobytes())
    
    print(f"Created binary file: {binary_path}")

def convert_all_files():
    """Convert all JSON files to binary format."""
    embeddings_dir = Path("public/embeddings")
    
    # Convert each year file
    for year in range(2005, 2026):
        json_path = embeddings_dir / f"word2vec_{year}.json"
        binary_path = embeddings_dir / f"word2vec_{year}.bin"
        
        if json_path.exists():
            convert_json_to_binary(json_path, binary_path)
    
    # Create binary index file
    create_binary_index(embeddings_dir)

def create_binary_index(embeddings_dir):
    """Create a binary index file with metadata."""
    print("Creating binary index file...")
    
    index_data = {}
    for year in range(2005, 2026):
        json_path = embeddings_dir / f"word2vec_{year}.json"
        if json_path.exists():
            with open(json_path, 'r') as f:
                data = json.load(f)
                index_data[str(year)] = {
                    "dimension": data['dimension'],
                    "vocab_size": data['vocab_size']
                }
    
    # Write binary index
    index_path = embeddings_dir / "index.bin"
    with open(index_path, 'wb') as f:
        # Write number of years (4 bytes)
        f.write(struct.pack('<I', len(index_data)))
        
        # Write each year's metadata
        for year, metadata in index_data.items():
            year_int = int(year)
            f.write(struct.pack('<III', year_int, metadata['vocab_size'], metadata['dimension']))
    
    print(f"Created binary index: {index_path}")

if __name__ == "__main__":
    convert_all_files()
