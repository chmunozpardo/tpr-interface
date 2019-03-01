var xElements = 3;
var yElements = 3;
var dx_tip = -50;
var dy_tip = 30;

var xElementsInterp = 30;
var yElementsInterp = 30;

var heatmap_name = '[id="heatmap"]';
var calibration_name = '[id="calibration"]';
var nodeselection_name = '#node_selection';
var dataselection_name = '#selected_map';
var color_scheme = d3.interpolateSpectral;
var selected_map = 'TemperatureNode';
var map_series_selection = 'Map';
var date_i_date = '';
var date_f_date = '';

var nodes_data = {};
var map_data = {};

var dataFormatNode = [
    'TemperatureNode',
    'MoistureNode',
    'AccelerationNode',
    'ElevationNode',
    'AzimuthNode',
    'SNRNode',
    'RSSINode',
    'FEINode',
    'FlagsNode',
    'StatusNode'
];

var dataFormatUnits = {
    'TemperatureNode' :     ' °C',
    'MoistureNode' :        ' %',
    'AccelerationNode' :    ' g',
    'ElevationNode' :       ' °',
    'AzimuthNode' :         ' °',
    'SNRNode' :             ' dB',
    'RSSINode' :            ' dBm',
    'FEINode' :             ' Hz',
    'FlagsNode' :           '',
    'StatusNode' :          ''
};

function invert_scheme(d){
    return color_scheme(1-d);
};

function select_dates() {
    var dateFormat = 'dd/mm/yy';

    var from = $('#from')
    .datepicker({
        defaultDate: '-4d',
        changeMonth: true,
        numberOfMonths: 1
    })
    .on('change', function(){
        to.datepicker('option', 'minDate', getDateDatePicker( this, 0, 'to'));
        to.datepicker('option', 'maxDate', getDateDatePicker( this, 4, 'to'));
        $(this).datepicker('option', 'minDate', null);
        $(this).datepicker('option', 'maxDate', 0);
        date_i_date = new Date(this.value)
        date_f_date = setDateDatePicker($('#to').datepicker('getDate'))
    });

     $('#from').datepicker('setDate', new Date());

    var to = $('#to').datepicker({
        defaultDate: '0d',
        changeMonth: true,
        numberOfMonths: 1,
        maxDate: 0
    })
    .on('change', function(){
        from.datepicker('option', 'maxDate', getDateDatePicker( this,  0, 'from'));
        from.datepicker('option', 'minDate', getDateDatePicker( this, -4, 'from'));
        $(this).datepicker('option', 'minDate', null);
        $(this).datepicker('option', 'maxDate', 0);
        date_i_date = setDateDatePicker($('#from').datepicker('getDate'))
        date_f_date = new Date(this.value)
    });

    $('#to').datepicker('setDate', new Date());
 
    function getDateDatePicker(element, diff, opt){
        var date;
        var date_tmp;
        var date_tmp_aux;
        var date_tmp_out;
        try{
            date_tmp_aux = new Date();
            date_tmp = new Date(element.value);
            date_tmp.setDate(date_tmp.getDate() + parseInt(diff));
            if(opt == 'to'){
                if(date_tmp > date_tmp_aux){
                    date_tmp_out = new Date(date_tmp_aux);
                }
                else{
                    date_tmp_out = new Date(date_tmp);
                }
            }
            else{
                date_tmp_out = date_tmp;
            }
            date = $.datepicker.parseDate( dateFormat,  date_tmp_out.getDate() + '/' + (date_tmp_out.getMonth()+1) + '/' + date_tmp_out.getFullYear());
        } catch( error ) {
            date = null;
        }
        return date;
    }

    function setDateDatePicker(datetime){
        date = $.datepicker.parseDate( dateFormat,  datetime.getDate() + '/' + (datetime.getMonth()+1) + '/' + datetime.getFullYear());
        return date;
    }
};

function drawChart(data_unparsed) {

    var data = [];
    for(var i = 0; i < data_unparsed.length; i++) {
        data.push(
        {
            date: new Date(data_unparsed[i]['date']),
            value: data_unparsed[i]['value']
        })
    }

    var svgWidth = 690, svgHeight = 590;
    var margin = { top: 60, right: 40, bottom: 30, left: 100 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select('[id="timeseries"]')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    svg.selectAll("*").remove()

    var g = svg.append('g')
    .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')'
    );

    var x = d3.scaleTime().rangeRound([0, width - 50]);
    var y = d3.scaleLinear().rangeRound([height, 0]);

    var line = d3.line()
        .x(function(d){ return x(d.date) })
        .y(function(d){ return y(d.value) });

    x.domain(d3.extent(data, function(d){ return d.date }));
    y.domain(d3.extent(data, function(d){ return d.value }));

    function make_x_gridlines(){
        return d3.axisBottom(x).ticks(10)
    };

    function make_y_gridlines(){
        return d3.axisLeft(y).ticks(5)
    };

    g.append('g')
    .attr('class', 'grid')
    .call(make_x_gridlines()
        .tickSize(height)
        .tickFormat('')
    );

    g.append('g')
    .attr('class', 'grid')
    .call(make_y_gridlines()
        .tickSize(-(width-50))
        .tickFormat('')
    );

    g.append('g')
    .attr('class', 'white_axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))

    g.append('g')
    .attr('class', 'white_axis')
    .call(d3.axisBottom(x))
    .attr('stroke-width', 2)
    .selectAll('text')
    .remove()

    g.append('g')
    .attr('class', 'white_axis')
    .attr('transform', 'translate(' + parseInt(width - 50) + ', 0)')
    .call(d3.axisLeft(y))
    .attr('stroke-width', 2)
    .selectAll('text')
    .remove()

    g.append('g')
    .attr('class', 'white_axis')
    .call(d3.axisLeft(y))
    .append('text')
    .attr('id', 'serie_unit')
    .attr('fill', '#000')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('dx', '-0.71em')
    .attr('text-anchor', 'end')
    .text($(dataselection_name).val() +' [' + dataFormatUnits[selected_map] +']');

    g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('stroke-width', 2)
    .attr('d', line);

    svg.selectAll('.dot')
    .data(data)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', function(d){ return x(d.date) + margin.left })
    .attr('cy', function(d){ return y(d.value) + margin.top })
    .attr('r', 5)
    .attr('opacity', 0.0)
    .on('mouseover', function(d){
        x_t = d3.select(this).attr('cx')
        y_t = d3.select(this).attr('cy')
        w = d3.select(this).attr('r')
        h = d3.select(this).attr('r')
        cx = parseInt(x_t)+parseInt(w)/2
        cy = parseInt(y_t)+parseInt(h)/2
        dx = cx+dx_tip
        dy = cy-dy_tip
        asdf = new Date(d.date)
        d3.select('[id="timeseries"]').append('rect')
            .attr('id', 'tip_rect')
            .attr('x', parseInt(x_t)-70)
            .attr('y', parseInt(y_t)-60)
            .attr('width', 140)
            .attr('height', 40)
            .attr('fill', 'black')
            .attr('opacity', 0.7)
            .style('pointer-events','none');
        d3.select('[id="timeseries"]').append('text')
            .attr('id', 'tip_text_date')
            .text(''+asdf.getDate()+'/'+(asdf.getMonth()+1)+'/'+asdf.getFullYear()+'-'+('0' + asdf.getHours()).slice(-2)+':'+('0' + asdf.getMinutes()).slice(-2))
            .attr('text-anchor', 'end')
            .attr('x', parseInt(x_t)+68)
            .attr('y', parseInt(y_t)-45)
            .attr('fill', 'white')
            .attr('font-size', '16px')
            .style('pointer-events','none');
        d3.select('[id="timeseries"]').append('text')
            .attr('id', 'tip_text_value')
            .text(''+d.value.toFixed(3) + dataFormatUnits[selected_map])
            .attr('text-anchor', 'end')
            .attr('x', parseInt(x_t)+68)
            .attr('y', parseInt(y_t)-25)
            .attr('fill', 'white')
            .attr('font-size', '16px')
            .style('pointer-events','none');
        d3.select('[id="timeseries"]').append('line')
            .attr('id', 'tip_line')
            .attr('x1', x_t)
            .attr('y1', y_t)
            .attr('x2', parseInt(x_t)-70)
            .attr('y2', parseInt(y_t)-20)
            .attr('stroke-width', 1)
            .attr('stroke', 'red')
            .style('pointer-events','none');
        d3.select('[id="timeseries"]').append('circle')
            .attr('id', 'tip_circle')
            .attr('cx', x_t)
            .attr('cy', y_t)
            .attr('r', 3)
            .attr('fill', 'red')
            .style('pointer-events','none');
        $(this).attr('class', 'focus')
    })
    .on('mouseout', function(){
        d3.select('#tip_rect').remove();
        d3.select('#tip_text_date').remove();
        d3.select('#tip_text_value').remove();
        d3.select('#tip_line').remove();
        d3.select('#tip_circle').remove();
        $(this).attr('class', 'dot')
    });
}

function renderColor(){

    d3.selection.prototype.moveToFront = function(){
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    var data_f = new Array(xElementsInterp * yElementsInterp);
    var min_val = map_data['z_0'];
    var max_val = map_data['z_0'];

    for(var i = 0; i < Object.keys(map_data).length; i++){
        data_f[i] = map_data['z_'+i];
        if(map_data['z_'+i] < min_val){
            min_val = map_data['z_'+i];
        }
        if(map_data['z_'+i] > max_val){
            max_val = map_data['z_'+i];
        }
    }

    var svg = d3.select(heatmap_name),
        width = +svg.attr('width'),
        height = +svg.attr('height');

    svg.selectAll('path').remove();
    svg.selectAll('defs').remove();

    for(var i = 0; i < xElements*yElements; i++){
        svg.select('rect[id=node_acc_'+i+']').remove();
        svg.select('line[id=arrow_line_'+i+']').remove();
    }

    var svg = d3.select(calibration_name);
    svg.select('rect[id=calib_rect]').remove();

    if(selected_map == 'MoistureNode'){
        min_val =   0.0;
        max_val = 60.0;
        svg.append('rect')
            .attr('id', 'calib_rect')
            .attr('width', 500)
            .attr('height', 17)
            .attr('x', 0)
            .attr('y', 0)
            .style('fill', 'url(#svgGradient_normal)');
    }
    else if(selected_map == 'TemperatureNode'){
        min_val =  0.0;
        max_val = 30.0;
        svg.append('rect')
            .attr('id', 'calib_rect')
            .attr('width', 500)
            .attr('height', 17)
            .attr('x', 0)
            .attr('y', 0)
            .style('fill', 'url(#svgGradient_inverted)');
    }
    else if(selected_map == 'AccelerationNode' || selected_map == 'ElevationNode' || selected_map == 'AzimuthNode'){
        min_val =  0.0;
        max_val = 60.0;
        svg.append('rect')
            .attr('id', 'calib_rect')
            .attr('width', 500)
            .attr('height', 17)
            .attr('x', 0)
            .attr('y', 0)
            .style('fill', 'url(#svgGradient_inverted)');
    }

    $('#less').text(min_val.toFixed(2) + '')
    $('#more').text(max_val.toFixed(2) + '')

    var svg = d3.select(heatmap_name);

    if(selected_map == 'AccelerationNode' || selected_map == 'ElevationNode' || selected_map == 'AzimuthNode'){
        var defs = svg.append('svg:defs')
        var marker = defs.append('svg:marker')
            .attr('id', 'arrow')
            .attr('refX', 0)
            .attr('refY', 2)
            .attr('markerWidth', 15)
            .attr('markerHeight', 15)
            .attr('markerUnits', 'strokeWidth')
            .attr('orient', 'auto')
            .attr('fill', '#000')

        marker.append('path').attr('d', "M0,0 L0,4 L6,2 z")
        rect_w = width/xElements
        rect_h = height/yElements
        var thresholds = d3.range(0.0, 60.0);
        var color = d3.scaleLinear()
            .domain(d3.extent(thresholds))
            .interpolate(function() { return invert_scheme;});
        for(var i = 0; i < xElements; i++){
            for(var j = 0; j < yElements; j++){
                force = nodes_data['node_'+(i+xElements*j)]['AccelerationNode']
                elev = nodes_data['node_'+(i+xElements*j)]['ElevationNode']
                azim = nodes_data['node_'+(i+xElements*j)]['AzimuthNode'] * Math.PI/180.0
                svg.append('rect')
                    .attr('id', 'node_acc_'+(i+xElements*j))
                    .attr('x', rect_w*i)
                    .attr('y', rect_h*j)
                    .attr('width', rect_w)
                    .attr('height', rect_h)
                    .attr('fill', color(Math.abs(elev)))
                svg.append('line')
                    .attr('id', 'arrow_line_'+(i+xElements*j))
                    .attr('x1', rect_w*(i + 1/2))
                    .attr('y1', rect_h*(j + 1/2))
                    .attr('x2', rect_w*(i + 1/2) + elev/60 * rect_w/2 * Math.cos(azim))
                    .attr('y2', rect_h*(j + 1/2) - elev/60 * rect_h/2 * Math.sin(azim))
                    .attr('stroke-width', 3)
                    .attr('stroke', 'black')
                    .attr('marker-end', 'url(#arrow)')
            }
        }
    }
    else if(selected_map == 'MoistureNode'){
        off_th = 50.9;
        epsilon = 0.5;
        var thresholds = d3.range(min_val, max_val);
        var thresholds2 = d3.range(off_th-epsilon, off_th+epsilon);

        var color = d3.scaleLinear()
            .domain(d3.extent(thresholds))
            .interpolate(function() { return color_scheme; });

        var contours = d3.contours()
            .size([xElementsInterp, yElementsInterp])
            .thresholds(thresholds);

        var contours2 = d3.contours()
            .size([xElementsInterp, yElementsInterp])
            .thresholds(thresholds2);

        path_tmp = svg.selectAll('path');

        path_tmp.data(contours(data_f))
            .enter().append('path')
            .attr('d', d3.geoPath(d3.geoIdentity().scale(width / xElementsInterp)))
            .attr('fill', function(d) { return color(d.value); })

        path_tmp.data(contours2(data_f))
            .enter().append('path')
            .attr('d', d3.geoPath(d3.geoIdentity().scale(width / xElementsInterp)))
            .attr('stroke', 'black')
            .attr('stroke-width', 5)
            .attr('fill', 'none')

        path_tmp.data(contours2(data_f))
            .enter().append('path')
            .attr('class', 'blink_me')
            .attr('d', d3.geoPath(d3.geoIdentity().scale(width / xElementsInterp)))
            .attr('stroke', 'none')
            .attr('fill', 'rgba(0, 0, 255, 0.75)')
    }
    else{
        var thresholds = d3.range(min_val, max_val);
        var color = d3.scaleLinear()
            .domain(d3.extent(thresholds))
            .interpolate(function() { return invert_scheme; });
        var contours = d3.contours()
            .size([xElementsInterp, yElementsInterp])
            .thresholds(thresholds);
        svg.selectAll('path')
            .data(contours(data_f))
            .enter().append('path')
            .attr('d', d3.geoPath(d3.geoIdentity().scale(width / xElementsInterp)))
            .attr('fill', function(d) { return color(d.value); });
    }

    for(var i = 0; i < xElements*yElements; i++){
        svg.select('rect[id=node_'+i+']').moveToFront();
    }
    d3.select('#tip_rect').moveToFront();
    d3.select('#tip_text').moveToFront();
    d3.select('#tip_line').moveToFront();
    d3.select('#tip_circle').moveToFront();

}

setInterval(get_data, 1000);

function get_data() {

    var x = new XMLHttpRequest();

    x.onreadystatechange = function(){
        if(x.status === 200 && x.readyState === 4) {
            var jsonResp = JSON.parse(x.responseText);
            var nodes_strings = jsonResp['strings'];
            var nodes_length = jsonResp['nodes_length'];
            map_data = jsonResp['map_data'];
            for(var j = 0; j < nodes_length; j++){
                nodes_data['node_'+j] = jsonResp['node_'+j];
                for(var i = 0; i < dataFormatNode.length - 2; i++){
                    nodes_data['node_'+j][dataFormatNode[i]] = nodes_data['node_'+j][dataFormatNode[i]].toFixed(3)
                }
                if(j==$(nodeselection_name).val()){
                    for(var i = 0; i < dataFormatNode.length; i++){
                        element_id = '#'+dataFormatNode[i];
                        $(element_id).text(nodes_data['node_'+j][dataFormatNode[i]] + dataFormatUnits[dataFormatNode[i]]);
                    }
                }
            }
            if(map_series_selection=='Map'){
                renderColor();
            }
            else if(map_series_selection=='Serie'){
                drawChart(jsonResp['time_data']);
            }
        }
    }
    x.open('GET', '/data_query?' + 'interp=' + selected_map
                                 + '&map=' + map_series_selection
                                 + '&node_n=' + $(nodeselection_name).val()
                                 + '&init_date=' +  date_i_date.getDate() + '/' + (date_i_date.getMonth()+1) + '/' + date_i_date.getFullYear()
                                 + '&finish_date=' + date_f_date.getDate() + '/' + (date_f_date.getMonth()+1) + '/' + date_f_date.getFullYear(), true);
    x.send();
};

$(document).ready(function(){

    date_i_date = new Date();
    date_f_date = new Date();

    height_logo = $('#logo_background').height()

    node_info_status = 1;

    $('#nav_data').on('click', function(){
        if(map_series_selection == 'Map'){
            $('#map_div').css({display: 'none'});
            $('#serie_div').css({display: 'block'});
            map_series_selection = 'Serie';
        }
        else{
            $('#map_div').css({display: 'block'});
            $('#serie_div').css({display: 'none'});
            map_series_selection = 'Map';
        }
    });

    $(dataselection_name).on('change', function(){
        selected_map = $(this).val() + 'Node';
    });

    $(nodeselection_name).on('change', function(){
        j = $(nodeselection_name).val();
        for(var i = 0; i < dataFormatNode.length; i++){
            $('#'+dataFormatNode[i]).text(nodes_data['node_'+j][dataFormatNode[i]] + dataFormatUnits[dataFormatNode[i]]);
        }
    });

    var svg = d3.select(calibration_name);

    var defs = svg.append('defs');

    var gradient = defs.append('linearGradient')
        .attr('id', 'svgGradient_normal');

    for(var i = 0; i <= 100; i += 5){
        gradient.append('stop')
        .attr('class', 'stop-' + i)
        .attr('offset', i + '%')
        .attr('stop-color', color_scheme(i/100))
        .attr('stop-opacity', 1);
    }

    var gradient = defs.append('linearGradient')
        .attr('id', 'svgGradient_inverted');

    for(var i = 0; i <= 100; i += 5){
        gradient.append('stop')
        .attr('class', 'stop-' + i)
        .attr('offset', i + '%')
        .attr('stop-color', invert_scheme(i/100))
        .attr('stop-opacity', 1);
    }

    var svg = d3.select(calibration_name);
    svg.append('rect')
        .attr('id', 'calib_rect')
        .attr('width', 500)
        .attr('height', 17)
        .attr('x', 0)
        .attr('y', 0)
        .style('fill', 'url(#svgGradient)');

    var min_val = 1
    var max_val = 100
    $('#less').text(min_val.toFixed(2) + '')
    $('#more').text(max_val.toFixed(2) + '')

    var svg = d3.select(heatmap_name),
    width = +svg.attr('width'),
    height = +svg.attr('height');

    for(var i = 0; i < xElements; i++){
        for(var j = 0; j < yElements; j++){
            svg.append('rect')
                .attr('id', 'node_'+(i+xElements*j))
                .attr('x', width*i/xElements)
                .attr('y', height*j/xElements)
                .attr('width', width/xElements)
                .attr('height', height/xElements)
                .attr('opacity', 0.0)
                .on('mouseover', function(){
                    x_t = d3.select(this).attr('x')
                    y_t = d3.select(this).attr('y')
                    w = d3.select(this).attr('width')
                    h = d3.select(this).attr('height')
                    cx = parseInt(x_t)+parseInt(w)/2
                    cy = parseInt(y_t)+parseInt(h)/2
                    dx = cx+dx_tip
                    dy = cy-dy_tip
                    d3.select(this).attr('opacity', 0.3);
                    d3.select(heatmap_name).append('rect')
                        .attr('id', 'tip_rect')
                        .attr('x', dx)
                        .attr('y', dy-20)
                        .attr('width', 100)
                        .attr('height', 25)
                        .attr('fill', 'black')
                        .attr('opacity', 0.3)
                        .style('pointer-events','none');
                    d3.select(heatmap_name).append('text')
                        .attr('id', 'tip_text')
                        .text(''+nodes_data[d3.select(this).attr('id')][selected_map] + dataFormatUnits[selected_map])
                        .attr('text-anchor', 'end')
                        .attr('x', dx-2*dx_tip-5)
                        .attr('y', dy-2)
                        .attr('fill', 'white')
                        .attr('font-size', '16px')
                        .style('pointer-events','none');
                    d3.select(heatmap_name).append('line')
                        .attr('id', 'tip_line')
                        .attr('x1', cx)
                        .attr('y1', cy)
                        .attr('x2', dx)
                        .attr('y2', dy-20+25)
                        .attr('stroke-width', 1)
                        .attr('stroke', 'red')
                        .style('pointer-events','none');
                    d3.select(heatmap_name).append("circle")
                        .attr('id', 'tip_circle')
                        .attr('cx', cx)
                        .attr('cy', cy)
                        .attr('r', 3)
                        .attr('fill', 'red')
                        .style('pointer-events','none');
                })
                .on('mouseout', function(){
                    d3.select('#tip_rect').remove();
                    d3.select('#tip_text').remove();
                    d3.select('#tip_line').remove();
                    d3.select('#tip_circle').remove();
                    d3.select(this).attr('opacity', 0.0);
                })
                .on('click', function(){
                    node_id = d3.select(this).attr('id');
                    node_val = node_id.split('node_');
                    $(nodeselection_name).val(node_val[1]);
                    for(var i = 0; i < dataFormatNode.length; i++){
                        element_id = '#'+dataFormatNode[i];
                       $(element_id).text(nodes_data[node_id][dataFormatNode[i]] + dataFormatUnits[dataFormatNode[i]]);
                    }
                });
        }
    }

    $(window).scroll(function(){
        if($(this).scrollTop() >= height_logo){
            $('#logo_2').css({opacity : 1.0});
            $('.navbar').addClass('fixed');
        }
        else {
            $('#logo_2').css({opacity : 0.0});
            $('.navbar').removeClass('fixed');
        }
    });
});