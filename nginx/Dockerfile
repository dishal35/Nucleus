FROM nginx:alpine

# Remove default NGINX configuration
RUN rm /etc/nginx/conf.d/default.conf
 
# Copy our custom configuration
COPY nginx.conf /etc/nginx/nginx.conf 