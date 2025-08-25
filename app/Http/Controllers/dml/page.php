<?php

final class PageBuilder
{
    private string $html_path;

    private function GetHtml(string $outline): string
    {
        foreach (glob(realpath($this->html_path) . DIRECTORY_SEPARATOR . $outline . "*.html") as $html) {
            $c = basename($html)[strlen($outline)];
            if ($c != '.' && ctype_digit("" . $c) !== true) {
                return file_get_contents($html);
            }
        }
        return "";
    }

    private function GetIndicesIMPL(array &$htmls, array $page_indices, int $lvl = 0, string $outline = ""): void
    {
        $page = 1;
        $outline = $outline == "" ? "" : $outline . ".";
        foreach ($page_indices as $key => $value) {
            $lvln = $outline . $page;
            $html = $this->GetHtml($lvln);
            if ($html !== "") {
                array_push($htmls, $html);
            }
            if (is_array($value) || $value instanceof Traversable) {
                $this->GetIndicesIMPL($htmls, $value, $lvl + 1, $lvln);
            }
            ++$page;
        }
    }

    private function BuildIMPL(array $page_indices, TCPDF $pdf_ctx, int $lvl = 0, string $outline = ""): void
    {
        $page = 1;
        $outline = $outline == "" ? "" : $outline . ".";
        foreach ($page_indices as $key => $value) {
            $lvln = $outline . $page;
            $html = $this->GetHtml($lvln);
            if (is_array($value) || $value instanceof Traversable) {
                $pdf_ctx->Bookmark($lvln . "    " . $key, $lvl, 0, '', '');
                $pdf_ctx->writeHTML("<p><b>" . $lvln . "   " . $key . "</b></p>", true, false, true, false, '');
                $pdf_ctx->writeHTML($html, true, false, true, false, '');
                $this->BuildIMPL($value, $pdf_ctx, $lvl + 1, $lvln);
            } else {
                $pdf_ctx->Bookmark($lvln . "    " . $value, $lvl, 0, '', '');
                $pdf_ctx->writeHTML("<p><b>" . $lvln . "   " . $value . "</b></p>", true, false, true, false, '');
                $pdf_ctx->writeHTML($html, true, false, true, false, '');
            }
            ++$page;
        }
    }

    public function __construct(string $html_path)
    {
        $this->html_path = $html_path;
    }

    public function GetIndices(array $page_indices): array
    {
        $htmls = [];
        $this->GetIndicesIMPL($htmls, $page_indices);
        return $htmls;
    }

    public function Build(array $page_indices, TCPDF $pdf_ctx): void
    {
        $this->BuildIMPL($page_indices, $pdf_ctx);
    }
}

class PageContent
{
    protected $sub_contents;
    protected string $name;
    public function __construct($sub_contents = null)
    {
        $this->sub_contents = $sub_contents;
    }

    public function DoBookMark(TCPDF $pdf_ctx, int $lvl): void
    {
        $pdf_ctx->Bookmark($this->name, $lvl, 0, '', 'B');
        $pdf_ctx->Cell(0, 10, $this->name, 0, 1, 'L');
    }

    public function AddContent(TCPDF $pdf_ctx): void
    {
    }
}

final class Introduccion extends PageContent
{
    public string $name = "INTRODUCCIÓN";

    public function DoBookMark(TCPDF $pdf_ctx, int $lvl): void
    {
        $pdf_ctx->AddPage();
        parent::DoBookMark($pdf_ctx, $lvl);
    }
}

final class Generalidades extends PageContent
{
    public string $name = "GENERALIDADES";
}

final class Objetivos extends PageContent
{
    public string $name = "OBJETIVOS";
}

/* "INTRODUCCIÓN",
"GENERALIDADES",
".	OBJETIVOS",
"DESCRIPCIÓN DEL SISTEMA ESTRUCTURAL",
"NORMATIVIDAD",
"EVALUACIÓN",
".	CÁLCULO DE AFORO",
".	COMPONENTES DEL PLAN",
".	DISTRIBUCIÓN ARQUITECTÓNICA",
".	DENSIDAD DE OCUPACIÓN DE LA EDIFICACIÓN",
".	CARACTERÍSTICAS DE LOS USUARIOS",
"RUTAS DE EVACUACIÓN Y AFORO",
".	ANCHO LIBRE DE PUERTAS Y RAMPAS",
".	ANCHO LIBRE PARA PASAJES DE CIRCULACIÓN",
".	ANCHO LIBRE DE ESCALERAS",
"CÁLCULO DE CAPACIDAD DE MEDIOS DE EVACUACIÓN",
".	CÁLCULO DE CAPACIDAD DE MEDIOS DE EVACUACIÓN",
"INSTALACIONES DE SEGURIDAD",
".	DETECTORES DE HUMO Y TEMPERATURA",
".	SEÑALIZACIÓN DE RUTAS DE EVACUACIÓN",
".	ILUMINACIÓN DE RUTAS DE EVACACIÓN",
".	SEÑALIZACIÓN",
".	CRITERIOS PARA SEÑALIZACIÓN",
".	SEÑALIZACIÓN UTILIZADA",
"SEÑALIZACIÓN PODOTÁCTIL",
"	PLAN DE SEGURIDAD EN SITUACIONES DE EMERGENCIA",
"BASE LEGAL",
"OBJETIVOS",
"DESCRIPCIÓN DE LAS OPERACIONES",
"ORGANIZACIÓN DE LAS BRIGADAS",
".	COMITÉ DE SEGURIDAD",
".	BRIGADAS",
".	FUNCIONES DE LAS BRIGADAS",
".	PAUTAS PARA LAS BRIGADAS",
".	PAUTAS PARA EL PERSONAL QUE SE ENCUENTRE EN LA ZONA DE EMERGENCIA",
"EQUIPAMIENTO",
".	MÉTODOS DE PROTECCIÓN",
".	PLANOS DE SEGURIDAD DE LA INSTITUCIÓN EDUCATIVA",
"SISTEMAS DE COMUNICACIÓN DE EMERGENCIA",
"ACCIONES DE RESPUESTA",
"ORGANISMO DE APOYO AL PLAN DE SEGURIDAD",
".	INCENDIOS",
".	EN CASOS DE FUGAS",
".	CONSIDERACIONES ESPECIALES",
".	LLUVIAS INTENSAS",
".	SISMOS",
".	VIENTOS FUERTES",
"PROGRAMA DE CAPACITACIÓN DE LAS BRIGADAS",
".	PROCEDIMIENTO DE COORDINACIÓN ENTRE INSTITUCIONES Y/O VIVIENDAS DEL ENTORNO",
".	ENLACE CON LOS COMITÉS DE DEFENSA CIVIL DISTRITALES/PROVINCIALES, SEGÚN CORRESPONDA",
".	ENLACE CON EL CUERPO GENERAL DE BOMBEROS VOLUNTARIOS DEL PERÚ",
".	ENLACE CON LA POLICÍA NACIONAL DEL PERÚ",
".	ENLACE CON LOS SERVICIOS DE SALUD PÚBLICA Y PRIVADA",
"	PROGRAMA DE CAPACITACIONES DE LAS BRIGADAS", */