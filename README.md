#Run the image in a container

```
docker run -d \
        -p 3500:3000 \
        -e API_BASE_URL=https://maboo.mg \
        --name maboo_admin_fe \
        lucienozandry/maboo-admin-fe:latest
```