
$("svg").attr("id", "panzoom");
$("#p_row").addClass("pixel-row");
$("#p_row rect").addClass("pixel-cell");
$("#p_row path").addClass("pixel-cell");
$("#p_row polygon").addClass("pixel-cell");

// panzoom initialization and options
const element = document.getElementById('panzoom')
const panzoom = Panzoom(element, {
    animate: false,
    pinchAndPan: true,
    panOnlyWhenZoomed: true,
    exclude: [".modal"],
    maxScale: 100,
    contain: "outside",
    step: 1
});

//toglle action buttons
$(".button-togller").click(function () {
    $(this).next("div").toggleClass("show");
})

// mark erase move
function drawHandler(params, obj) {
    $(".colors > a").removeClass("selected");
    $(".cursor-types > .d-flex > a").removeClass("selected");
    $(obj).addClass("selected");

    currentTool = "#7d81ff";

    if (params == '#7d81ff') {
        $(".colors > .default").addClass("selected");
        $(".cursor-types .default").addClass("selected");

        $("svg").css("cursor", "url('images/marker.svg') 0 32, auto");
        panzoom.destroy();
        currentTool = params;
    } else if (params == 'erase') {
        $("svg").css("cursor", "url('images/eraser.svg') 0 32, auto");
        panzoom.destroy();
        currentTool = "#ffffff";
    } else if (params == 'move') {
        $("svg").css("cursor", "move");
        panzoom.bind();
    } else {
        $("svg").css("cursor", "url('images/marker.svg') 0 32, auto");
        panzoom.destroy();
        currentTool = params;
    }

    $('.pixel-picker-container').pixelPicker({
        rowSelector: '.pixel-row',
        cellSelector: '.pixel-cell',
        palette: [
            currentTool
        ]
    });
}

drawHandler('move');

//dynamic color
var jsonData;
$.getJSON('colors.json', function (i) {
    jsonData = i;
    Object.keys(i).forEach(key => {
        i[key].hexCode = "'" + i[key].hexCode + "'";
        $("#colorBtns").append('<a href="javascript:void(0)" data-cursor="' + i[key].dataCursor + '" class="' + key + '" onclick="drawHandler(' + i[key].hexCode + ', this)"></a>');
        $("#colorBtns " + "." + key).css("background-color", i[key].hexCode);
    });
})

document.addEventListener('click', function (e) {
    if (!document.getElementById('cursorBtnTogller').contains(e.target) && !document.getElementById('cursorTypes').contains(e.target)) {
        $("#cursorTypes").removeClass("show");
    }
});

document.addEventListener('click', function (e) {
    if (!document.getElementById('colorBtnTogller').contains(e.target) && !document.getElementById('colorOption').contains(e.target)) {
        $("#colorOption").removeClass("show");
    }
});

// panzoom mouse wheel
const parent = element.parentElement
parent.addEventListener('wheel', panzoom.zoomWithWheel);

// jquery range slider
var valCount = 0;
$("#slider-range-min").slider({
    range: "min",
    value: 0,
    step: 5,
    min: 0,
    max: 100,
    slide: function (event, ui) {
        $("#amount").val(ui.value * 2 + "%");
        panzoom.zoom(ui.value);
        valCount = ui.value;
    }
});

// change jquery range slider on mouse wheel
parent.addEventListener("wheel", function (e) {
    if (e.deltaY < 0 && valCount < 100) {
        valCount += 5;
        $("#amount").val(valCount * 2 + "%");
        if ($("#amount").val() > 200) {
            $("#amount").val(200 + "%");
        }
        $("#slider-range-min").slider("value", valCount);
    }
    else if (e.deltaY > 0 && valCount > 0) {
        valCount -= 5;
        $("#amount").val(valCount * 2 + "%");
        if ($("#amount").val() < 0) {
            $("#amount").val(0 + "%");
        }
        $("#slider-range-min").slider("value", valCount);
    }
    e.preventDefault();
    e.stopPropagation();
})

//modal
var geoModal = new bootstrap.Modal(document.getElementById("plotInfo"));

$('g[id^="rc_"]').contextmenu(function (e) {
    e.preventDefault();

    var splitted = this.id.split("_");
    $(".modal-title").html("Dag No. : " + splitted[1] + " Classlist: ");

    var cellGroup = document.querySelectorAll("#" + this.id + " .pixel-cell");

    for (var l in jsonData) {
        if (jsonData.hasOwnProperty(l)) {
            for (var k in cellGroup) {
                if (cellGroup.hasOwnProperty(k)) {
                    if ($(cellGroup[k]).hasClass(jsonData[l].dataCursor)) {
                        console.log($(cellGroup[k]).hasClass(jsonData[l].dataCursor));
                        $(".tbody").append('<div class="tr ' + jsonData[l].dataCursor + '"> <div class="td"> <span>1</span> </div> <div class="td"> <span>Joy Das</span> </div> <div class="td"> <span>10 Katha</span> </div> <div class="td"> <span>1 Cr</span> </div> <div class="td"> <span>null</span> </div></div>');
                        $(".tr" + "." + jsonData[l].dataCursor).css({
                            "background-color": jsonData[l].hexCode,
                            "border": "1px solid rgba(255, 255, 255, 0.25)"
                        });
                        $(".modal-title").append(jsonData[l].dataCursor + " ");
                        break
                    }
                }
            }
        }
    }

    geoModal.show();
});

$('#plotInfo').on('hidden.bs.modal', function () {
    $('.tbody .tr').remove();
})

//tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


//save check
function saveHandler(params) {
    if (params == 0) {
        $(".save-alert").addClass("show");
        $(window).bind('beforeunload', function () {
            return "Are you sure about leaving this site ? Changes you made may not be saved";
        });
    } else {
        $(".save-alert").removeClass("show");
        $(window).unbind('beforeunload');
    }
}

saveHandler();

$("#saveNow").on("click", function () {
    Swal.fire({
        title: "Are you sure !",
        text: "Do you want to save the changes ?",
        icon: "warning",
        iconColor: '#FFC107',
        showCancelButton: true,
        confirmButtonColor: "#2E3192",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, save now"
    }).then((result) => {
        saveHandler();
        if (result.isConfirmed) {
            Swal.fire({
                title: "Saved",
                text: "Your changes have been saved successfully",
                icon: "success",
                iconColor: '#198754',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            saveHandler(0);
        }
    });
})
