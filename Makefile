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

# Generar build de producción
build:
	npm run build

# Construir la imagen Docker
docker-build:
	$(CONTAINER) build -t my-phaser3-game .

# Ejecutar la aplicación en un contenedor
docker-run:
	$(CONTAINER) run -d --rm -p 8080:80 my-phaser3-game

# Limpieza de artefactos de build
clean:
	rm -rf juego-aviones/dist

# Tarea por defecto: instalar y compilar
all: install build