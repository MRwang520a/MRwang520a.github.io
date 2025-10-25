#!/bin/bash
# 修復 ai.service.ts 中的 possibly undefined 錯誤
sed -i 's/return response\.data\[0\]\.url;/return response.data![0].url;/g' src/services/ai.service.ts
sed -i 's/return imageResponse\.data\[0\]\.url;/return imageResponse.data![0].url;/g' src/services/ai.service.ts

# 修復 task.service.ts 中的類型錯誤
sed -i 's/task\.parameters as any/task.parameters || {} as any/g' src/services/task.service.ts
sed -i 's/task\.parameters?\.prompt/((task.parameters || {}) as any).prompt/g' src/services/task.service.ts
sed -i 's/task\.parameters?\.scale/(task.parameters as any)?.scale/g' src/services/task.service.ts
sed -i 's/task\.parameters?\.targetLang/(task.parameters as any)?.targetLang/g' src/services/task.service.ts

echo "TypeScript errors fixed"
