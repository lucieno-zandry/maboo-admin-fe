#Run the image in a container

```
docker run -d \
        -p 4500:3000 \
        -e API_BASE_URL=http://102.16.254.6:9000 \
        --name wle_backoffice_fe \
        lucienozandry/wle-backoffice-fe:latest
```