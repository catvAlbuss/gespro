<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            margin: 20px;
            padding: 0;
        }
        .titulo {
            text-align: center;
            margin-bottom: 20px;
            font-size: 16px;
        }
        .grafico {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            display: block;
        }
        .leyenda {
            font-size: 10px;
            margin-top: 10px;
            text-align: left;
        }
        .leyenda span {
            display: inline-block;
            width: 20px;
            height: 10px;
            margin-right: 5px;
            vertical-align: middle;
        }
        .leyenda .square {
            display: inline-block;
            width: 10px;
            height: 10px;
            margin-right: 5px;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <h2 class="titulo">{{ $titulo }}</h2>

    <img src="{{ $imagen }}" class="grafico" alt="Gráfico Gantt"/>

    <div class="leyenda">
        <strong>Leyenda:</strong><br>
        <span style="background: #87CEEB;"></span> Tarea activa &nbsp;
        <span style="background: #D3D3D3;"></span> Informe resumen &nbsp;
        <span style="background: #90EE90;"></span> Hito externo &nbsp;
        <span class="square" style="background: red;"></span> Fecha límite
    </div>
</body>
</html>