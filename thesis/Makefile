## Compilation requires a LaTeX engine. Options:
##
##   1. Podman (available on this system):
##        make pdf           (uses Podman + texlive/texlive)
##
##   2. Local texlive (install with: sudo pacman -S texlive-full):
##        make pdf-local
##
##   3. Overleaf: drag-and-drop thesis/ folder into overleaf.com
##
##   4. Tectonic (single-binary LaTeX):
##        make pdf-tectonic  (requires: cargo install tectonic)

CONTAINER_CMD := podman
DOCKER_IMAGE  := docker.io/texlive/texlive:latest
MAIN          := FormatoTesis
OUTDIR        := build_apa

CONTAINER_RUN := $(CONTAINER_CMD) run --rm \
	-v "$(CURDIR):/workspace:z" \
	-w /workspace \
	$(DOCKER_IMAGE)

.PHONY: all pdf pdf-local pdf-tectonic clean distclean pull

all: pdf

# Build PDF using Podman + texlive container
pdf:
	mkdir -p $(OUTDIR)
	$(CONTAINER_RUN) latexmk -pdf -interaction=nonstopmode \
		-outdir=$(OUTDIR) $(MAIN).tex

# Build PDF using locally installed pdflatex + latexmk
pdf-local:
	mkdir -p $(OUTDIR)
	latexmk -pdf -interaction=nonstopmode \
		-outdir=$(OUTDIR) $(MAIN).tex

# Build PDF using Tectonic (auto-downloads packages)
pdf-tectonic:
	tectonic $(MAIN).tex

# Pull the texlive Docker/Podman image (run once)
pull:
	$(CONTAINER_CMD) pull $(DOCKER_IMAGE)

clean:
	rm -f $(OUTDIR)/*.log $(OUTDIR)/*.aux $(OUTDIR)/*.out \
		$(OUTDIR)/*.toc $(OUTDIR)/*.bbl $(OUTDIR)/*.blg \
		$(OUTDIR)/*.fls $(OUTDIR)/*.fdb_latexmk \
		$(OUTDIR)/*.synctex.gz $(OUTDIR)/*.run.xml

distclean: clean
	rm -rf $(OUTDIR)
