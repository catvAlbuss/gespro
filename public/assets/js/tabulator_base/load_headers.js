const headerHTML = `
      <table style="width: 100%" class="table_header header">
        <thead>
          <tr>
            <th colspan="4" class="bg_green font-14">MEMORIA DE CALCULO - INSTALACIONES SANITARIAS</th>
          </tr>
          <tr>
            <th scope="row">PROYECTO :</th>
            <td colspan="3" class="proyecto"></td>
          </tr>
          <tr class="text_left">
            <th scope="row">UE</th>
            <th scope="row" class="ue"></th>
            <th scope="row">FECHA :</th>
            <th scope="row" class="fecha"></th>
          </tr>
          <tr class="text_left">
            <th scope="row">CUI : <span class="cui"></span></th>
            <th scope="row">Cod. Modular : <span class="codModular"></span></th>
            <th scope="row">Cod. Local : <span class="CodigoLocal"></span></th>
            <th></th>
          </tr>
          <tr class="text_left">
            <th scope="row">UBICAION :</th>
            <th scope="row" colspan="3" class="ubicacion"></th>
          </tr>
        </thead>
      </table>`;
document.querySelectorAll(".header_dummy").forEach((header) => {
  header.innerHTML = headerHTML;
});
