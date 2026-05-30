#!/bin/bash

# Pastikan script berhenti jika ada error
set -e

echo "🚀 Memulai Sinkronisasi Backend & Frontend..."

# 1. Masuk ke folder backend dan generate OpenAPI
echo "📂 Step 1: Generating openapi.json di backend..."
cd backend
PYTHONPATH=. ../.venv/bin/python generate_openapi.py
echo "✅ openapi.json berhasil dibuat."

# 2. Copy ke frontend
echo "📂 Step 2: Menyalin openapi.json ke folder frontend..."
cp openapi.json ../frontend/openapi.json

# 3. Masuk ke folder frontend dan generate client SDK
echo "📂 Step 3: Regenerating Frontend SDK menggunakan Bun..."
cd ../frontend
~/.bun/bin/bun run generate-client
echo "✅ Frontend SDK berhasil diperbarui."

echo "✨ Sinkronisasi SELESAI! Anda bisa melanjutkan development."
