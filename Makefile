# Detectar herramienta de contenedores (Docker o Podman)
CONTAINER := $(shell command -v docker >/dev/null 2>&1 && echo docker || (command -v podman >/dev/null 2>&1 && echo podman))
ifeq ($(CONTAINER),)
$(error Se requiere Docker o Podman instalado)
endif

.PHONY: all install dev build docker-build docker-run clean

# Instalar dependencias
install:
	npm install

# Arrancar en modo desarrollo con hot reload
dev:
	npm run dev

# Generar build de producción (no necesario para Node.js, pero mantenemos para compatibilidad)
build:
	@echo "No build step required for Node.js application"

# Construir la imagen Docker
docker-build:
	$(CONTAINER) build -t prueba-chat .

# Ejecutar la aplicación en un contenedor
docker-run:
	$(CONTAINER) run -d --rm -p 3000:3000 --name prueba-chat-container prueba-chat

# Ejecutar la aplicación en modo desarrollo
run:
	npm start

# Limpieza de artefactos de build
clean:
	rm -rf node_modules
	$(CONTAINER) rmi prueba-chat 2>/dev/null || true
	$(CONTAINER) rm prueba-chat-container 2>/dev/null || true

# Tarea por defecto: instalar dependencias
all: clean install build run

all-docker: docker-build docker-run