
1. Write random prettier config files for data augmentation

		node ./writeconfigs.js
2. Find matching open source repositories using GitHub API (output is included in repo)

		yarn install
		yarn run ts-node find.ts > repos.txt
3. Clone GitHub repos

		mkdir repos && cd repos
		../clone.sh ../repos.txt
4. Create input data file by merging all matching files from the cloned repos, formatted with each of the prettier configs
		
		./concat.sh
5. Clean the input data file (allcode.txt) to remove all non-ascii chars for a smaller output layer size 
		
		./clean.sh
