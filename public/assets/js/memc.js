import { ubigeos } from "./dml/ubigeos.js";
import { tables } from "./dml/tables.js";

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = option.text = value;
    select.add(option);
  });
}

function clearSelect(select) {
  select.options.length = 0;
  select.innerHTML = "";
}

function fillValues() {
  document.querySelectorAll("[data-editable]:not(img)").forEach((replace) => {
    const to_replace = replace.getAttribute("data-editable");
    if (values[to_replace] !== undefined) {
      replace.textContent = values[to_replace];
    }
  });

  document.querySelectorAll("img[data-editable]").forEach((replace) => {
    const to_replace = replace.getAttribute("data-editable");
    if (values[to_replace] !== undefined) {
      replace.src = values[to_replace];
    }
  });
}

function addEditables() {
  document.querySelectorAll("[data-table]").forEach((replace) => {
    tables[replace.getAttribute("data-table")](replace);
  });

  document.querySelectorAll("img[data-editable]").forEach((replace) => {
    if (values[replace.getAttribute("data-editable")] !== undefined) return;
    const style = window.getComputedStyle(replace);
    const image_selector_component = `
    <style>
    #image-container {
      width: ${style.width};
      height: ${style.height};
      border: 2px dashed #ccc;
      text-align: center;
      cursor: pointer;
    }
    #image-container img {
      max-width: 100%;
      max-height: 100%;
    }
    #file-input {
      display: none;
    }
    </style>
    <div id="image-container">
      <img id="image" src="" alt="Uploaded Image" style="display: none;">
    </div>
    <input type="file" id="file-input" accept="image/*">`;
    replace.outerHTML = image_selector_component;
    const imageContainer = document.getElementById("image-container");
    const image = document.getElementById("image");
    const fileInput = document.getElementById("file-input");

    imageContainer.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        values[replace.getAttribute("data-editable")] = image.src =
          e.target.result;
        image.style.display = "block";
      };

      reader.readAsDataURL(file);
    });
  });

  document.querySelectorAll("[data-editable]:not(img)").forEach((replace) => {
    if (values[replace.getAttribute("data-editable")] === undefined) {
      const input = document.createElement("input");
      input.required = true;
      input.classList.add("form-control");
      input.classList.add("input-group-sm");
      replace.appendChild(input);
    }
  });
}

var htmls;
var values = {};
let current_index = 0;

$.ajax({
  url: '/editor-dml',
  type: 'POST',
  dataType: 'json',
  headers: {
    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
  },
  success: function (json_htmls) {
    htmls = json_htmls;
  },
  error: function (xhr, status, error) {
    console.error("Error en la solicitud:", error);
    // Mostrar la respuesta completa del servidor para depurar
    console.error("Respuesta del servidor:", xhr.responseText);
  }
});


function setPage() {
  const page = document.getElementById("page");
  page.innerHTML = htmls[current_index];
  fillValues();
  addEditables();
}

document.addEventListener("DOMContentLoaded", function () {
  var select_dpto = document.getElementById("region");
  var select_prov = document.getElementById("provincia");
  var select_dist = document.getElementById("distrito");

  fillSelect(select_dpto, Object.keys(ubigeos));
  select_dpto.addEventListener("change", () => {
    clearSelect(select_prov);
    fillSelect(select_prov, Object.keys(ubigeos[select_dpto.value]));
    select_prov.dispatchEvent(new Event("change"));
  });
  select_prov.addEventListener("change", () => {
    clearSelect(select_dist);
    fillSelect(select_dist, ubigeos[select_dpto.value][select_prov.value]);
  });

  select_dpto.dispatchEvent(new Event("change"));
  select_prov.dispatchEvent(new Event("change"));

  // Event listener for the "Next" button
  document.getElementById("siguiente").addEventListener("click", () => {
    if (current_index < htmls.length - 1) {
      ++current_index;
      setPage();
    }
  });

  document.getElementById("anterior").addEventListener("click", () => {
    if (current_index > 0) {
      current_index--;
      setPage();
    }
  });

  const form_datos = document.getElementById("datos_generales");
  form_datos.addEventListener("submit", async function (event) {
    event.preventDefault();
    var data = new FormData(form_datos);
    let fileReadPromises = [];
    data.forEach((value, key) => {
      if (value instanceof File) {
        let fileReadPromise = new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.onload = (event) => {
            values[key] = event.target.result;
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(value);
        });
        fileReadPromises.push(fileReadPromise);
      } else {
        values[key] = value;
      }
    });
    await Promise.all(fileReadPromises);
    setPage();
  });

  document.getElementById("generate_pdf").addEventListener("submit", function (event) {
    event.preventDefault();

    //const formData = new FormData(this);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const submitButton = this.querySelector('button[type="submit"]');

    // Disable button and show loading state
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Generando PDF...';
    }

    $.ajax({
      url: '/memoria-calculo',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      },
      xhrFields: {
        responseType: 'blob'  // Important for receiving binary data
      },
      success: function (blob, status, xhr) {
          console.log(blob);
        // Create a URL for the Blob
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "memoria_descriptiva.pdf";
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: function (xhr, status, error) {
        console.error("Error generating PDF:", error);
        alert("Error al generar el PDF. Por favor, intente nuevamente.");
      },
      complete: function () {
        // Re-enable button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Generar PDF';
        }
      }
    });
  });
});
