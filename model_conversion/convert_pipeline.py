#!/usr/bin/env python3
"""
Complete conversion pipeline: .model -> .json -> .bin
This script handles the entire conversion process with verification.
"""

import subprocess
import sys
from pathlib import Path

def run_conversion_step(step_name, script_name, description):
    """Run a conversion step and handle errors."""
    print(f"\n{'='*60}")
    print(f"STEP: {step_name}")
    print(f"DESCRIPTION: {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=True, text=True, check=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error in {step_name}:")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False

def main():
    """Run the complete conversion pipeline."""
    print("🚀 Starting conversion pipeline: .model -> .json -> .bin")
    
    # Step 1: Convert .model files to .json
    if not run_conversion_step(
        "MODEL TO JSON", 
        "convert_models.py",
        "Convert pickle .model files to JSON format"
    ):
        print("❌ Failed at step 1. Stopping.")
        return
    
    # Step 2: Convert .json files to .bin
    if not run_conversion_step(
        "JSON TO BINARY", 
        "convert_to_binary.py",
        "Convert JSON files to compact binary format"
    ):
        print("❌ Failed at step 2. Stopping.")
        return
    
    # Step 3: Verify conversion integrity
    if not run_conversion_step(
        "VERIFY CONVERSION", 
        "verify_binary_conversion.py",
        "Verify no data loss between JSON and binary formats"
    ):
        print("❌ Verification failed. Check the conversion.")
        return
    
    print("\n🎉 CONVERSION PIPELINE COMPLETE!")
    print("✅ All files converted successfully")
    print("✅ No data loss detected")
    print("✅ Ready for GitHub Pages deployment")

if __name__ == "__main__":
    main()
