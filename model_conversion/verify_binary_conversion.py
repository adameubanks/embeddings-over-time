#!/usr/bin/env python3
"""
Verify that binary conversion preserves all data exactly.
"""

import json
import struct
import numpy as np
from pathlib import Path

def verify_conversion(json_path, binary_path):
    """Verify that binary file matches JSON file exactly."""
    print(f"Verifying {json_path} vs {binary_path}...")
    
    # Load JSON data
    with open(json_path, 'r') as f:
        json_data = json.load(f)
    
    # Load binary data
    with open(binary_path, 'rb') as f:
        # Read header
        vocab_size, dimension = struct.unpack('<II', f.read(8))
        
        # Read vocabulary
        vocab = []
        for _ in range(vocab_size):
            word_bytes = b""
            while True:
                char = f.read(1)
                if char == b'\x00':
                    break
                word_bytes += char
            vocab.append(word_bytes.decode('utf-8'))
        
        # Read vectors
        vectors = {}
        for word in vocab:
            vector_bytes = f.read(dimension * 4)  # float32 = 4 bytes
            vector = np.frombuffer(vector_bytes, dtype=np.float32)
            vectors[word] = vector.tolist()
    
    # Compare metadata
    if json_data['vocab_size'] != vocab_size:
        print(f"❌ Vocab size mismatch: JSON={json_data['vocab_size']}, Binary={vocab_size}")
        return False
    
    if json_data['dimension'] != dimension:
        print(f"❌ Dimension mismatch: JSON={json_data['dimension']}, Binary={dimension}")
        return False
    
    # Compare vocabulary
    if json_data['vocab'] != vocab:
        print(f"❌ Vocabulary mismatch")
        return False
    
    # Compare vectors
    json_vectors = json_data['vectors']
    for word in vocab:
        json_vec = json_vectors[word]
        bin_vec = vectors[word]
        
        # Compare as float32 to handle precision differences
        json_array = np.array(json_vec, dtype=np.float32)
        bin_array = np.array(bin_vec, dtype=np.float32)
        
        if not np.array_equal(json_array, bin_array):
            print(f"❌ Vector mismatch for word '{word}'")
            return False
    
    print(f"✅ Perfect match!")
    return True

def verify_all_files():
    """Verify all converted files."""
    embeddings_dir = Path("public/embeddings")
    all_good = True
    
    for year in range(2005, 2026):
        json_path = embeddings_dir / f"word2vec_{year}.json"
        binary_path = embeddings_dir / f"word2vec_{year}.bin"
        
        if json_path.exists() and binary_path.exists():
            if not verify_conversion(json_path, binary_path):
                all_good = False
    
    if all_good:
        print("\n🎉 All files verified successfully - no data loss!")
    else:
        print("\n❌ Some files have data loss!")

if __name__ == "__main__":
    verify_all_files()
