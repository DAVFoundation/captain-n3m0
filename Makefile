FORCE:

start: FORCE
	npm start

jest: FORCE
	npm test

proxy: FORCE
	parallel ::: \
		"kubectl port-forward -n davnn deployment/davnn 9092:9092" \
		"kubectl port-forward -n davnn deployment/davnn 3010:80"
