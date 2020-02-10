$(window).on('load', function() {

var selectedRegion;
var theTable;
var width = "90%",
    height = 600;

d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vTLRN1EN_DljnDSWFpo8Xa-HAh4bcL9pIbpVDP29qLhVquaHrnSDQKoRfiK_XapIgReFnj6mT0vh2b8/pub?gid=1559371642&single=true&output=csv", function(error, data){

// d3.csv("data/media_dataset.csv", function (error, data) {
    if (error) throw error;
    var table;
    
    const drawT = function(targetData) {
        table = d3.select('#example');
    
        var tableHead = table.append('thead'),
             tableBody = table.append('tbody');
    
        
        //table header
        tableHead.append('tr').selectAll('th')
             .data(["Название", "Тип", "Главный редактор", "Собственник", "Контакты"]).enter()
             .append('th')
             .attr("data-th",function (d) {
                     if(d === "Главный редактор") {
                         return "Редактор";
                     } else {
                         return d
                     }
             })
             .text(function (d) { return d; });

        //table body
        var rows = tableBody.selectAll('tr')
             .data(targetData)
             .enter()
             .append('tr')
             .attr("data", function(d){
                 return d["ОБЛАСТЬ"]
             });
    
        //додаємо іконку-вказівник сайту, лінк для переходу і курсор-поінтер тільки якщо є сайт

        const firstColumn = rows.append('td')
             .attr("class", "td-link")
             .attr("data-th", "Название")
             .attr("class", "flex-mobile")
             .append("div");


        firstColumn
            .append("p")
            .html(function (d) { return d["НАЗВАНИЕ.СМИ"]; });

        firstColumn.append("p")
            .text(function (d) { return d['web']; })
            .attr('class', 'web-link')
            .attr("onclick", function (d) {
                if(d['web'].length > 0) {
                    return "window.open('" +d.web +"', '_blank')"
                }
            })
             .style("cursor", function(d) {
                 if(d['web'].length > 0) {
                     return "pointer"
                 }
             })
        ;
    
        rows.append('td')
             .attr("data-th", "Тип")
             .attr("class", "flex-mobile")
             .text(function (d) {
                 return d["ТИП.СМИ"];
             });
    
        rows.append('td')
             .attr("data-th", "Редактор")
             .attr("class", "flex-mobile")
             .text(function (d) {
                 return d["ГЛАВНЫЙ.РЕДАКТОР"];
             });
    
        rows.append('td')
             .attr("data-th", "Владелец")
             .attr("class", "flex-mobile")
             .text(function (d) {
                 return d["СОБСТВЕННИК"];
             });
    
        rows.append('td')
             .attr("data-th", "Контакты")
             .attr("class", "flex-mobile")
             .append("div")                      
             .html(function (d) {
                 return "<b>Адрес</b>: " +
                     d["ОБЛАСТЬ"] + ", "+
                     d["ГОРОД.РАЙОНЫ"] + ", " + d["АДРЕС.СМИ"] + " <b>Телефон:</b> " + d["ТЕЛЕФОН"] + "<b> E-mail:</b> " + d["email"] + "<br>";
             });
     
        rows.append('td')
             .text(function (d) {
                 return d["ОБЛАСТЬ"];
             });

    
        //налаштування для таблиці - мова, порядок сортування, довжина, приховані колонки
            theTable = $('#example').DataTable({
                responsive: true,
                "order": [[0, "desc"]],
                "pageLength": 10,
                "language": {
                    "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Russian.json"
                },
                "columnDefs": [
                    {
                        "targets": [5],
                        "visible": false,
                        "searchable": true
                    }
                ]
            });



        //додаємо пошук по кожній колонці (з data-table official)
        $('#example thead tr').clone(true).appendTo( '#example thead' );

        $('#example thead tr:eq(1) th:eq(0)')
            .each(function (i) {
            $(this).html( '<input type="text" placeholder="Поиск" />' );
            $( 'input', this ).on( 'keyup change', function () {
                if (theTable.column(i).search() !== this.value ) {
                    theTable
                        .column(i)
                        .search( this.value )
                        .draw();
                }
            });
        });

        $('#example thead tr:eq(1) th:eq(2), ' +
            '#example thead tr:eq(1) th:eq(3), ' +
            '#example thead tr:eq(1) th:eq(4)')
            .each(function (i) {
                $(this).html( '<input type="text" placeholder="Поиск" />' );
                $( 'input', this ).on( 'keyup change', function () {
                    if (theTable.column(i+2).search() !== this.value ) {
                        theTable
                            .column(i+2)
                            .search( this.value )
                            .draw();
                    }
                });
            });






        //select option  в другу колонку
        $('#example thead tr:eq(1) th:eq(1)').each(function (i) {
                var column = this;
                var select = $('<select><option value="" selected></option></select>');
                $(this).html( select );

                $( 'select', this ).on( 'change', function () {
                    var val = $.fn.dataTable.util.escapeRegex(
                        $(this).val()
                    );
                    console.log(val);

                        theTable
                            .column(1)
                            .search( this.value )
                            .draw();
                });


            theTable.column( 1 ).data().unique().each( function ( d, j ) {
                select.append( '<option value="'+d+'">'+d+'</option>' )
            });


        });

     };


    
    //Намалювати таблицю
    drawT(data);
   
    //Приєдуємо svg-карту і таблицю
    d3.xml("img/map2.svg").mimeType("image/svg+xml").get(function (error, xml) {  
        if (error) {  throw error }
        
        d3.select("#map").node().appendChild(xml.documentElement);

        var svg = d3.select("#map svg")
            .attr("width", width)
            .style("margin", "auto");
        
        svg.selectAll("polygon")
            .classed("region-chart", true);
        
        svg.selectAll("path")
            .classed("region-chart", true);
        
        d3.selectAll('.region-chart').on("click", function(d){
            d3.selectAll("circle").style('fill', '#c7edff').style('opacity', '1');
            d3.selectAll(".region-chart").style('fill', '#8493e7').style('opacity', '1');
            d3.select(this).style('fill', '#d075db').style('opacity', '1');
            selectedRegion = $(this).find("title").text();
            theTable.search( selectedRegion ).draw();            
            $([document.documentElement, document.body]).animate({ scrollTop: $("#selected-region").offset().top}, 1000);  //прокрутка до таблички на клік            
            $("#selected-region").html(selectedRegion);                    
        });

        d3.selectAll('circle').on("click", function(d){
            d3.selectAll("circle").style('fill', '#c7edff').style('opacity', '1');
            d3.selectAll(".region-chart").style('fill', '#8493e7').style('opacity', '1');
            d3.select(this).style('fill', '#d075db').style('opacity', '1');
            selectedRegion = $(this).find("title").text();
            theTable.search( selectedRegion ).draw();
            $([document.documentElement, document.body]).animate({ scrollTop: $("#selected-region").offset().top}, 1000);  //прокрутка до таблички на клік
            $("#selected-region").html(selectedRegion);
        });

    });

});


});








