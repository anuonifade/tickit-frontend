#!/bin/bash
set -e

# Replace environment variables in the built JavaScript files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:3000/api/v1|${REACT_APP_API_URL}|g" {} \;

# Execute the command provided as arguments (e.g., nginx -g 'daemon off;')
exec "$@"
