#!/bin/bash

echo "🎭 Construindo o frontend..."
cd frontend
npm run build

echo "📦 Copiando para o Rails..."
cd ..
rm -rf public/assets public/index.html public/vite.svg
cp -r frontend/dist/* public/

echo "✅ Pronto! Acesse http://localhost:3000"
