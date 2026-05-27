import os
from PIL import Image, ImageDraw, ImageFont

# Configurar rutas de fuentes del sistema en Windows
FONT_REGULAR_PATH = "C:\\Windows\\Fonts\\segoeui.ttf"
FONT_BOLD_PATH = "C:\\Windows\\Fonts\\segoeuib.ttf"

# Fallback a Arial si Segoe UI no está disponible
if not os.path.exists(FONT_REGULAR_PATH):
    FONT_REGULAR_PATH = "C:\\Windows\\Fonts\\arial.ttf"
    FONT_BOLD_PATH = "C:\\Windows\\Fonts\\arialbd.ttf"

# Si no está en las rutas de Windows, usar fallbacks relativos
if not os.path.exists(FONT_REGULAR_PATH):
    FONT_REGULAR_PATH = "arial.ttf"
    FONT_BOLD_PATH = "arialbd.ttf"

# Colores del sistema de diseño (RGB)
COLOR_HEADER_BG = (26, 63, 111)      # Azul institucional oscuro
COLOR_HEADER_FG = (255, 255, 255)    # Blanco
COLOR_ROW_ALT = (240, 244, 248)      # Azul muy claro alterno
COLOR_ROW_WHITE = (255, 255, 255)    # Blanco
COLOR_TEXT_DARK = (44, 62, 80)        # Gris muy oscuro para texto principal
COLOR_GRID = (218, 226, 233)         # Gris claro para líneas de división
COLOR_BORDER = (180, 195, 210)       # Borde exterior de la tabla

# Colores de Badges
BADGE_EX_BG = (232, 245, 233)        # Verde pastel
BADGE_EX_FG = (27, 94, 32)           # Verde oscuro
BADGE_AC_BG = (255, 243, 224)        # Naranja pastel
BADGE_AC_FG = (230, 81, 0)           # Naranja oscuro
BADGE_DF_BG = (255, 235, 238)        # Rojo pastel
BADGE_DF_FG = (183, 28, 28)          # Rojo oscuro
BADGE_NT_BG = (245, 245, 245)        # Gris pastel
BADGE_NT_FG = (84, 110, 122)         # Gris oscuro

def draw_badge(draw, text, x, y, w, h, font, bg_color, fg_color):
    # Dibuja un badge con fondo redondeado
    draw.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=bg_color)
    # Centrar texto en el badge
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = x + (w - tw) // 2
    ty = y + (h - th) // 2 - 1  # Ajuste fino vertical
    draw.text((tx, ty), text, font=font, fill=fg_color)

def generate_table_image(filename, headers, rows, col_widths, row_height=50, header_height=60, font_size=15, badge_config=None, highlights=None):
    # Resolver fuentes
    try:
        font_regular = ImageFont.truetype(FONT_REGULAR_PATH, font_size)
        font_bold = ImageFont.truetype(FONT_BOLD_PATH, font_size)
        font_badge = ImageFont.truetype(FONT_BOLD_PATH, font_size - 2)
    except IOError:
        font_regular = ImageFont.load_default()
        font_bold = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    num_cols = len(headers)
    num_rows = len(rows)
    table_width = sum(col_widths)
    table_height = header_height + (num_rows * row_height)

    # Crear lienzo (con un margen de 2 píxeles para el borde)
    image = Image.new("RGB", (table_width + 4, table_height + 4), (255, 255, 255))
    draw = ImageDraw.Draw(image)

    # Coordenadas base
    base_x = 2
    base_y = 2

    # 1. Dibujar Encabezado
    draw.rectangle([base_x, base_y, base_x + table_width, base_y + header_height], fill=COLOR_HEADER_BG)
    current_x = base_x
    for i, header in enumerate(headers):
        w = col_widths[i]
        # Centrar texto vertical y horizontalmente en el encabezado
        # Soporta saltos de línea \n en encabezados
        lines = header.split('\n')
        total_h_lines = len(lines) * (font_size + 4) - 4
        start_y = base_y + (header_height - total_h_lines) // 2
        
        for line_idx, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=font_bold)
            tw = bbox[2] - bbox[0]
            tx = current_x + (w - tw) // 2
            ty = start_y + line_idx * (font_size + 4)
            draw.text((tx, ty), line, font=font_bold, fill=COLOR_HEADER_FG)
        
        current_x += w

    # 2. Dibujar Filas de Datos
    current_y = base_y + header_height
    for row_idx, row in enumerate(rows):
        # Color de fondo alterno
        bg_color = COLOR_ROW_ALT if row_idx % 2 == 1 else COLOR_ROW_WHITE
        # Si es una fila totalizadora (ej. fila de totales en pesos)
        if row_idx == num_rows - 1 and rows[row_idx][0] == "Total":
            bg_color = (230, 238, 245) # Fondo azul destacado para el total
            
        draw.rectangle([base_x, current_y, base_x + table_width, current_y + row_height], fill=bg_color)

        current_x = base_x
        for col_idx, cell_value in enumerate(row):
            w = col_widths[col_idx]
            
            # Verificar si esta celda tiene un badge configurado
            badge_type = None
            if badge_config and (row_idx, col_idx) in badge_config:
                badge_type = badge_config[(row_idx, col_idx)]
            elif badge_config and cell_value in ["Bajo", "Medio", "Alto", "Sin NP", "L3/L4", "L7+", "Excelente", "Aceptable", "Deficiente", "No"]:
                # Auto-detectar badges basados en texto común
                val = cell_value
                if val == "Excelente":
                    badge_type = "EX"
                elif val == "Aceptable":
                    badge_type = "AC"
                elif val == "Deficiente":
                    badge_type = "DF"
                elif val == "No":
                    badge_type = "DF"
                elif val == "Bajo":
                    # Bajo es excelente para latencia, cpu y ram, pero intermedio para throughput
                    if col_idx in [1, 3, 4] and "Trade" in filename: # Latencia, CPU, RAM
                        badge_type = "EX"
                    else:
                        badge_type = "AC"
                elif val == "Medio":
                    badge_type = "AC"
                elif val == "Alto":
                    # Alto es excelente para throughput, pero deficiente para RAM
                    if col_idx == 2 and "Trade" in filename: # Throughput
                        badge_type = "EX"
                    else:
                        badge_type = "DF"
                elif val in ["L3/L4", "Sí", "Sí (L3/L4)", "Sí (L7+)"]:
                    badge_type = "EX"
                elif val == "L7+":
                    badge_type = "EX"
                elif val == "Sin NP":
                    badge_type = "DF"

            # Dibujar celda
            if badge_type:
                # Dibujar Badge
                badge_w = int(w * 0.8)
                badge_h = int(row_height * 0.6)
                bx = current_x + (w - badge_w) // 2
                by = current_y + (row_height - badge_h) // 2
                
                if badge_type == "EX":
                    draw_badge(draw, cell_value, bx, by, badge_w, badge_h, font_badge, BADGE_EX_BG, BADGE_EX_FG)
                elif badge_type == "AC":
                    draw_badge(draw, cell_value, bx, by, badge_w, badge_h, font_badge, BADGE_AC_BG, BADGE_AC_FG)
                elif badge_type == "DF":
                    draw_badge(draw, cell_value, bx, by, badge_w, badge_h, font_badge, BADGE_DF_BG, BADGE_DF_FG)
                else:
                    draw_badge(draw, cell_value, bx, by, badge_w, badge_h, font_badge, BADGE_NT_BG, BADGE_NT_FG)
            else:
                # Dibujar texto normal
                # Soporta saltos de línea \n
                lines = str(cell_value).split('\n')
                total_h_lines = len(lines) * (font_size + 4) - 4
                start_text_y = current_y + (row_height - total_h_lines) // 2
                
                # Alinear a la izquierda para la primera columna, centrado para las demás
                align_left = (col_idx == 0)
                
                # Si es un valor destacado (highlight)
                is_highlight = False
                color_text = COLOR_TEXT_DARK
                font_to_use = font_regular

                if highlights and (row_idx, col_idx) in highlights:
                    is_highlight = True
                    hl_type = highlights[(row_idx, col_idx)]
                    if hl_type == "win":
                        color_text = BADGE_EX_FG
                        font_to_use = font_bold
                    elif hl_type == "fail":
                        color_text = BADGE_DF_FG
                        font_to_use = font_bold
                    elif hl_type == "bold":
                        font_to_use = font_bold

                for line_idx, line in enumerate(lines):
                    bbox = draw.textbbox((0, 0), line, font=font_to_use)
                    tw = bbox[2] - bbox[0]
                    
                    if align_left:
                        tx = current_x + 15  # margen izquierdo de 15px
                    else:
                        tx = current_x + (w - tw) // 2
                        
                    ty = start_text_y + line_idx * (font_size + 4)
                    draw.text((tx, ty), line, font=font_to_use, fill=color_text)
            
            # Dibujar líneas de rejilla vertical
            if col_idx < num_cols - 1:
                draw.line([current_x + w, current_y, current_x + w, current_y + row_height], fill=COLOR_GRID, width=1)
                
            current_x += w
            
        # Dibujar línea de rejilla horizontal
        draw.line([base_x, current_y + row_height, base_x + table_width, current_y + row_height], fill=COLOR_GRID, width=1)
        current_y += row_height

    # Dibujar líneas verticales del encabezado
    current_x = base_x
    for w in col_widths[:-1]:
        current_x += w
        draw.line([current_x, base_y, current_x, base_y + header_height], fill=COLOR_HEADER_BG, width=1)

    # 3. Dibujar Bordes de la Tabla
    draw.rectangle([base_x, base_y, base_x + table_width, base_y + table_height], outline=COLOR_BORDER, width=2)

    # Guardar imagen con alta resolución (se puede usar remuestreo si se requiere, pero dibujando directo ya es nítido)
    image.save(filename, "PNG")
    print(f"Tabla guardada en: {filename}")

def main():
    figures_dir = "c:\\Users\\holman.alba\\Documents\\Proyecto\\Tesis-Repos\\K8S-CNI-Results\\thesis\\figures"
    os.makedirs(figures_dir, exist_ok=True)

    # ─────────────────────────────────────────────────────────────────────────
    # 1. Tabla: apb_cni_tradeoffs.png
    # ─────────────────────────────────────────────────────────────────────────
    headers1 = ["CNI", "Latencia", "Throughput", "CPU", "RAM", "Seguridad"]
    rows1 = [
        ["Flannel", "Bajo", "Medio", "Bajo", "Bajo", "Sin NP"],
        ["Calico", "Bajo", "Alto", "Medio", "Alto", "L3/L4"],
        ["Cilium", "Medio", "Medio", "Bajo", "Alto", "L7+"],
        ["Antrea", "Medio", "Medio", "Medio", "Medio", "L3/L4"]
    ]
    col_widths1 = [130, 110, 110, 110, 110, 130]
    # Auto-badges se encarga de formatear
    generate_table_image(
        os.path.join(figures_dir, "apb_cni_tradeoffs.png"),
        headers1, rows1, col_widths1, row_height=48, header_height=54
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 2. Tabla: apb_criterios_metricas.png
    # ─────────────────────────────────────────────────────────────────────────
    headers2 = ["Criterio", "Pregunta Orientadora", "Métricas Técnicas", "Herramienta / Fuente"]
    rows2 = [
        [
            "C1 - Rendimiento\nde red",
            "¿Qué tan rápido y estable\nviaja la información?",
            "• Throughput TCP (Mbps)\n• Latencia promedio y máxima (ms)\n• Jitter / MDEV (ms)\n• Retransmisiones TCP",
            "• iperf3 (300s TCP, CronJob)\n• nc -z (30 muestras)\n• results/cni-benchmarks/"
        ],
        [
            "C2 - Eficiencia\nde recursos",
            "¿Cuánto «cobra» el CNI\npor funcionar?",
            "• CPU del agente CNI (%)\n• RAM del agente CNI (MB)",
            "• Prometheus (cpu_usage, memory_rss)\n• results/cni-benchmarks/"
        ],
        [
            "C3 - Impacto\nde seguridad",
            "¿Qué costo tiene activar\nlas reglas de firewall?",
            "• Overhead de latencia con NP (%)\n• Overhead de throughput con NP (%)",
            "• procesador.js (base vs. con NP activa)\n• results/cni-benchmarks/"
        ]
    ]
    col_widths2 = [170, 220, 280, 280]
    # Usar fuente de tamaño 13 para que quepa bien el texto multilínea
    generate_table_image(
        os.path.join(figures_dir, "apb_criterios_metricas.png"),
        headers2, rows2, col_widths2, row_height=100, header_height=58, font_size=13
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 3. Tabla: apb_datos_testbed.png
    # ─────────────────────────────────────────────────────────────────────────
    headers3 = ["Métrica", "Flannel", "Calico", "Cilium", "Antrea", "Mejor valor"]
    rows3 = [
        ["Latencia prom. (ms) (↓)", "21,53", "12,54", "18,73", "35,09", "Calico"],
        ["Latencia máx. (ms) (↓)", "50,80", "44,20", "47,00", "83,50", "Calico"],
        ["Jitter MDEV (ms) (↓)", "7,76", "7,31", "8,47", "17,25", "Calico"],
        ["Throughput (Mbps) (↑)", "1.452,97", "1.804,40", "843,56", "1.588,45", "Calico"],
        ["Retransmisiones TCP (↓)", "11.774", "68.993", "15.142", "42.229", "Flannel"],
        ["CPU agente CNI (%) (↓)", "19,45", "29,05", "25,79", "27,75", "Flannel"],
        ["RAM agente CNI (MB) (↓)", "1.176,54", "1.672,83", "1.497,19", "1.429,95", "Flannel"],
        ["Soporta Net. Policies", "No", "Sí (L3/L4)", "Sí (L7+)", "Sí (L3/L4)", "—"]
    ]
    col_widths3 = [210, 110, 110, 110, 110, 130]
    
    # Destacados en verde para el ganador y el mejor valor
    highlights3 = {
        (0, 2): "win", (0, 5): "win", # Latencia prom
        (1, 2): "win", (1, 5): "win", # Latencia max
        (2, 2): "win", (2, 5): "win", # Jitter
        (3, 2): "win", (3, 5): "win", # Throughput
        (4, 1): "win", (4, 5): "win", # Retransmisiones
        (5, 1): "win", (5, 5): "win", # CPU
        (6, 1): "win", (6, 5): "win", # RAM
    }
    
    # Configurar badges para la última fila
    badge_config3 = {
        (7, 1): "DF", # Flannel No NP
        (7, 2): "EX", # Calico
        (7, 3): "EX", # Cilium L7
        (7, 4): "EX", # Antrea
    }
    
    generate_table_image(
        os.path.join(figures_dir, "apb_datos_testbed.png"),
        headers3, rows3, col_widths3, row_height=42, header_height=50,
        highlights=highlights3, badge_config=badge_config3
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 4. Tabla: apb_umbrales_urllc.png (Caso 1)
    # ─────────────────────────────────────────────────────────────────────────
    headers4 = ["Métrica", "Excelente (5 pts)", "Aceptable (3 pts)", "Deficiente (1 pt)", "Fuente"]
    rows4 = [
        ["Latencia pod-to-pod avg (↓)", "< 1 ms", "1 - 10 ms", "> 10 ms", "(N)"],
        ["Jitter / MDEV (↓)", "< 0,1 ms", "0,1 - 1 ms", "> 1 ms", "(N)"],
        ["Throughput TCP (↑)", "> 1 Gbps", "0,1 - 1 Gbps", "< 100 Mbps", "(N)"],
        ["CPU overhead del CNI (↓)", "< 1%", "1 - 5%", "> 5%", "(E)"],
        ["RAM por nodo (↓)", "< 50 MB", "50 - 200 MB", "> 200 MB", "(E)"],
        ["Overhead latencia c/NP (↓)", "< 5%", "5 - 15%", "> 15%", "(P)"]
    ]
    col_widths4 = [220, 160, 160, 160, 80]
    
    badge_config4 = {
        (0, 1): "EX", (0, 2): "AC", (0, 3): "DF",
        (1, 1): "EX", (1, 2): "AC", (1, 3): "DF",
        (2, 1): "EX", (2, 2): "AC", (2, 3): "DF",
        (3, 1): "EX", (3, 2): "AC", (3, 3): "DF",
        (4, 1): "EX", (4, 2): "AC", (4, 3): "DF",
        (5, 1): "EX", (5, 2): "AC", (5, 3): "DF",
    }
    
    generate_table_image(
        os.path.join(figures_dir, "apb_umbrales_urllc.png"),
        headers4, rows4, col_widths4, row_height=42, header_height=50,
        badge_config=badge_config4
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 5. Tabla: apb_umbrales_edge.png (Caso 2)
    # ─────────────────────────────────────────────────────────────────────────
    rows5 = [
        ["Latencia pod-to-pod avg (↓)", "< 10 ms", "10 - 50 ms", "> 50 ms", "(N)(E)"],
        ["Jitter / MDEV (↓)", "< 1 ms", "1 - 5 ms", "> 5 ms", "(E)"],
        ["Throughput TCP (↑)", "> 80% del BW", "50 - 80% del BW", "< 50% del BW", "(E)"],
        ["CPU overhead del CNI (↓)", "< 5%", "5 - 15%", "> 15%", "(E)"],
        ["RAM por nodo (↓)", "< 50 MB", "50 - 150 MB", "> 150 MB", "(E)"],
        ["Overhead latencia c/NP (↓)", "< 10%", "10 - 20%", "> 20%", "(P)"]
    ]
    generate_table_image(
        os.path.join(figures_dir, "apb_umbrales_edge.png"),
        headers4, rows5, col_widths4, row_height=42, header_height=50,
        badge_config=badge_config4
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 6. Tabla: apb_umbrales_microservices.png (Caso 3)
    # ─────────────────────────────────────────────────────────────────────────
    rows6 = [
        ["Latencia pod-to-pod avg (↓)", "< 50 ms", "50 - 200 ms", "> 200 ms", "(I)"],
        ["Jitter / MDEV (↓)", "< 5 ms", "5 - 20 ms", "> 20 ms", "(I)"],
        ["Throughput TCP (↑)", "> 70% del BW", "50 - 70% del BW", "< 50% del BW", "(E)"],
        ["CPU overhead del CNI (↓)", "< 8%", "8 - 15%", "> 15%", "(E)"],
        ["RAM por nodo (↓)", "< 200 MB", "200 - 400 MB", "> 400 MB", "(E)"],
        ["Overhead latencia c/NP (↓)", "< 5%", "5 - 15%", "> 15%", "(E)"],
        ["Overhead throughput c/NP (↓)", "< 5%", "5 - 15%", "> 15%", "(P)"]
    ]
    badge_config6 = {
        (0, 1): "EX", (0, 2): "AC", (0, 3): "DF",
        (1, 1): "EX", (1, 2): "AC", (1, 3): "DF",
        (2, 1): "EX", (2, 2): "AC", (2, 3): "DF",
        (3, 1): "EX", (3, 2): "AC", (3, 3): "DF",
        (4, 1): "EX", (4, 2): "AC", (4, 3): "DF",
        (5, 1): "EX", (5, 2): "AC", (5, 3): "DF",
        (6, 1): "EX", (6, 2): "AC", (6, 3): "DF",
    }
    generate_table_image(
        os.path.join(figures_dir, "apb_umbrales_microservices.png"),
        headers4, rows6, col_widths4, row_height=42, header_height=50,
        badge_config=badge_config6
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 7. Tabla: apb_pesos_mcda.png
    # ─────────────────────────────────────────────────────────────────────────
    headers7 = ["Criterio de evaluación", "Fintech / Seguridad", "Streaming / Rendimiento", "IoT / Recursos"]
    rows7 = [
        ["Network Policies L7 (Seguridad)", "30%", "0%", "0%"],
        ["Latencia TCP (Tiempo de respuesta)", "20%", "35%", "20%"],
        ["Throughput TCP (Velocidad)", "15%", "35%", "25%"],
        ["Retransmisiones TCP (Estabilidad)", "15%", "20%", "15%"],
        ["CPU del agente CNI (Uso de proc.)", "10%", "10%", "30%"],
        ["RAM del agente CNI (Uso de mem.)", "10%", "0%", "10%"],
        ["Total", "100%", "100%", "100%"]
    ]
    col_widths7 = [260, 160, 180, 140]
    
    highlights7 = {
        (0, 1): "win",  # 30% seguridad fintech
        (1, 2): "win",  # 35% latencia streaming
        (2, 2): "win",  # 35% throughput streaming
        (4, 3): "win",  # 30% cpu iot
        (6, 0): "bold", (6, 1): "bold", (6, 2): "bold", (6, 3): "bold"  # Fila Total
    }
    
    generate_table_image(
        os.path.join(figures_dir, "apb_pesos_mcda.png"),
        headers7, rows7, col_widths7, row_height=40, header_height=50,
        highlights=highlights7
    )

    # ─────────────────────────────────────────────────────────────────────────
    # 8. Tabla: apb_resultados_mcda.png
    # ─────────────────────────────────────────────────────────────────────────
    headers8 = ["Perfil de usuario", "Flannel", "Calico", "Cilium", "Antrea"]
    rows8 = [
        ["Fintech / Seguridad", "0,112", "0,581", "* 0,834", "0,542"],
        ["Streaming / Rendimiento", "0,298", "0,651", "* 0,879", "0,603"],
        ["IoT / Recursos limitados", "0,521", "0,614", "0,487", "* 0,628"]
    ]
    col_widths8 = [220, 120, 120, 140, 140]
    
    highlights8 = {
        (0, 3): "win",  # Cilium en Fintech
        (1, 3): "win",  # Cilium en Streaming
        (2, 4): "win",  # Antrea en IoT
    }
    
    generate_table_image(
        os.path.join(figures_dir, "apb_resultados_mcda.png"),
        headers8, rows8, col_widths8, row_height=44, header_height=50,
        highlights=highlights8
    )

if __name__ == "__main__":
    main()
