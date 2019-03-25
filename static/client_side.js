$(document).ready(function(){

    var dimensions = {
        width : 0,
        height : 0
    };

    var elements = {
        meas : { x : 3, y : 3},
        interp : { x : 30, y : 30}
    };

    var margin = {
        top: 50,
        right: 30,
        bottom: 50,
        left: 80
    };

    var data = {
        nodes : {},
        map : {}
    }

    var date = {
        from : new Date(),
        to : new Date()
    };

    var dom_elements = {
        heatmap_name : '.heatmap',
        timedata_name : '.timemap',
        calibration_name : '.calibration-scale',
        nodeselection_name : '.node-selection',
        dataselection_name : '.selected_map',
        selected_map : 'TemperatureNode',
        map_series_selection : 'Map'
    };

    var data_format = {
        node : [
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
        ],
        units : {
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
        }
    };

    /* Initialize Heatmap */
    var tmp_height = d3.select('.data-container').node().getBoundingClientRect();
    var tmp_mapdata = d3.select('.mapdata-panel').node().getBoundingClientRect();
    var tmp_timedata = d3.select('.mid-panel').node().getBoundingClientRect();
    dimensions.width = tmp_mapdata.right - tmp_mapdata.left;
    dimensions.height = tmp_height.bottom - tmp_height.top;

    let heatmap = new Heatmap(dom_elements, dimensions, elements);
    heatmap.initializeMap(data, data_format);

    /* Initialize Timedata */
    dimensions.width = tmp_timedata.right - tmp_timedata.left;

    let timeserie = new Timedata(dom_elements, dimensions, margin);
    timeserie.initializeSerie(data, data_format);


    $('#nav_data').on('click', function(){
        if(dom_elements.map_series_selection == 'Map'){
            $('.mapdata-panel').css({display: 'none'});
            $('.timedata-panel').css({display: 'block'});
            dom_elements.map_series_selection = 'Serie';
        }
        else{
            $('.mapdata-panel').css({display: 'block'});
            $('.timedata-panel').css({display: 'none'});
            dom_elements.map_series_selection = 'Map';
        }
        get_data(dom_elements, date, data, data_format, heatmap, timeserie);
    });

    $(dom_elements.dataselection_name).on('change', function(){
        dom_elements.selected_map = $(this).val() + 'Node';
    });

    $(dom_elements.nodeselection_name).on('change', function(){
        j = $(dom_elements.nodeselection_name).val();
        for(var i = 0; i < data_format.node.length; i++){
            $('#'+data_format.node[i]).text(data.nodes['node_'+j][data_format.node[i]] + data_format.units[data_format.node[i]]);
        }
    });

    get_data();

    select_dates();

    function get_data(){

        var x = new XMLHttpRequest();

        x.onreadystatechange = function(){
            if(x.status === 200 && x.readyState === 4) {
                var jsonResp = JSON.parse(x.responseText);
                var nodes_strings = jsonResp['strings'];
                var nodes_length = jsonResp['nodes_length'];
                data.map = jsonResp['map_data'];
                for(var j = 0; j < nodes_length; j++){
                    data.nodes['node_'+j] = jsonResp['node_'+j];
                    for(var i = 0; i < data_format.node.length - 2; i++){
                        data.nodes['node_'+j][data_format.node[i]] = data.nodes['node_'+j][data_format.node[i]].toFixed(3)
                    }
                    if(j==$(dom_elements.nodeselection_name).val()){
                        for(var i = 0; i < data_format.node.length; i++){
                            element_id = '#'+data_format.node[i];
                            $(element_id).text(data.nodes['node_'+j][data_format.node[i]] + data_format.units[data_format.node[i]]);
                        }
                    }
                }
                if(dom_elements.map_series_selection=='Map'){
                    heatmap.renderColor(dom_elements, data);
                }
                else if(dom_elements.map_series_selection=='Serie'){
                    timeserie.drawChart(jsonResp['time_data'], data_format);
                }
            }
        }
        x.open('GET', '/data_query?' + 'interp=' + dom_elements.selected_map
                                     + '&map=' + dom_elements.map_series_selection
                                     + '&node_n=' + $(dom_elements.nodeselection_name).val()
                                     + '&init_date=' +  date.from.getDate() + '/' + (date.from.getMonth()+1) + '/' + date.from.getFullYear()
                                     + '&finish_date=' + date.to.getDate() + '/' + (date.to.getMonth()+1) + '/' + date.to.getFullYear(), true);
        x.send();
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
            date.from = new Date(this.value);
            date.to = setDateDatePicker($('#to').datepicker('getDate'));
            get_data();
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
            date.from = setDateDatePicker($('#from').datepicker('getDate'))
            date.to = new Date(this.value)
            get_data();
        });

        $('#to').datepicker('setDate', new Date());
     
        function getDateDatePicker(element, diff, opt){
            var date_out;
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
                date_out = $.datepicker.parseDate( dateFormat,  date_tmp_out.getDate() + '/' + (date_tmp_out.getMonth()+1) + '/' + date_tmp_out.getFullYear());
            } catch( error ) {
                date_out = null;
            }
            return date_out;
        }

        function setDateDatePicker(datetime){
            date_out = $.datepicker.parseDate( dateFormat,  datetime.getDate() + '/' + (datetime.getMonth()+1) + '/' + datetime.getFullYear());
            return date_out;
        }
    };
});

class Heatmap{

    constructor(dom_elements, dimensions, elements){
        this.heatmap_svg = d3.select(dom_elements.heatmap_name);
        this.calibration_svg = d3.select(dom_elements.calibration_name);
        this.selected_map = dom_elements.selected_map;

        if(dimensions.width <= dimensions.height - 100){
            this.svgWidth = dimensions.width;
            this.svgHeight = dimensions.width;
        }
        else{
            this.svgWidth = dimensions.height - 100;
            this.svgHeight = dimensions.height - 100;
        }

        this.x_elements = elements.meas.x;
        this.y_elements = elements.meas.y;

        this.x_interp = elements.interp.x;
        this.y_interp = elements.interp.y;
    }

    initializeMap(data, data_format){

        var dx_tip = -50;
        var dy_tip = 30;

        var self = this;

        self.heatmap_svg.attr('width', this.svgWidth);
        self.heatmap_svg.attr('height', this.svgHeight);

        var defs = self.calibration_svg.append('defs');

        var gradient = defs.append('linearGradient')
            .attr('id', 'svgGradient_normal');

        for(var i = 0; i <= 100; i += 5){
            gradient.append('stop')
            .attr('class', 'stop-' + i)
            .attr('offset', i + '%')
            .attr('stop-color', d3.interpolateSpectral(i/100))
            .attr('stop-opacity', 1);
        }

        var gradient = defs.append('linearGradient')
            .attr('id', 'svgGradient_inverted');

        for(var i = 0; i <= 100; i += 5){
            gradient.append('stop')
            .attr('class', 'stop-' + i)
            .attr('offset', i + '%')
            .attr('stop-color', self.invert_scheme(i/100))
            .attr('stop-opacity', 1);
        }

        var min_val = 1
        var max_val = 100
        $('#less').text(min_val.toFixed(2) + '')
        $('#more').text(max_val.toFixed(2) + '')

        self.calibration_svg.attr('width', self.svgWidth)
        self.calibration_svg.append('rect')
            .attr('id', 'calib_rect')
            .attr('width', self.svgWidth)
            .attr('height', 20)
            .style('fill', 'url(#svgGradient)');

        var desc = d3.select('.description');
        desc.style('width', self.svgWidth);

        for(var i = 0; i < this.x_elements; i++){
            for(var j = 0; j < this.y_elements; j++){
                self.heatmap_svg.append('rect')
                    .attr('id', 'node_'+(i+self.x_elements*j))
                    .attr('x', self.svgWidth*i/self.x_elements)
                    .attr('y', self.svgHeight*j/self.y_elements)
                    .attr('width', self.svgWidth/self.x_elements)
                    .attr('height', self.svgHeight/self.y_elements)
                    .attr('opacity', 0.0)
                    .on('mouseover', function(){
                        var x_t = $(this).attr('x');
                        var y_t = $(this).attr('y');
                        var w = $(this).attr('width');
                        var h = $(this).attr('height');
                        var cx = parseInt(x_t)+parseInt(w)/2;
                        var cy = parseInt(y_t)+parseInt(h)/2;
                        var dx = cx+dx_tip;
                        var dy = cy-dy_tip;
                        $(this).attr('opacity', 0.3);
                        self.heatmap_svg.append('rect')
                            .attr('id', 'tip_rect')
                            .attr('x', dx)
                            .attr('y', dy-20)
                            .attr('width', 100)
                            .attr('height', 25)
                            .attr('fill', 'black')
                            .attr('opacity', 0.3)
                            .style('pointer-events','none');
                        self.heatmap_svg.append('text')
                            .attr('id', 'tip_text')
                            .text(''+data.nodes[$(this).attr('id')][self.selected_map] + data_format.units[self.selected_map])
                            .attr('text-anchor', 'end')
                            .attr('x', dx-2*dx_tip-5)
                            .attr('y', dy-2)
                            .attr('fill', 'white')
                            .attr('font-size', '16px')
                            .style('pointer-events','none');
                        self.heatmap_svg.append('line')
                            .attr('id', 'tip_line')
                            .attr('x1', cx)
                            .attr('y1', cy)
                            .attr('x2', dx)
                            .attr('y2', dy-20+25)
                            .attr('stroke-width', 1)
                            .attr('stroke', 'red')
                            .style('pointer-events','none');
                        self.heatmap_svg.append("circle")
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
                        $(this).attr('opacity', 0.0);
                    })
                    .on('click', function(){
                        var node_id = $(this).attr('id');
                        var node_val = node_id.split('node_');
                        $(nodeselection_name).val(node_val[1]);
                        for(var i = 0; i < data_format.node.length; i++){
                            element_id = '#'+data_format.node[i];
                           $(element_id).text(data.nodes[node_id][data_format.node[i]] + data_format.units[data_format.node[i]]);
                        }
                    });
            }
        }
    }

    renderColor(dom_elements, data){

        var self = this;

        self.selected_map = dom_elements.selected_map;

        d3.selection.prototype.moveToFront = function(){
            return this.each(function(){
                this.parentNode.appendChild(this);
            });
        };

        var data_f = new Array(self.x_interp * self.y_interp);
        var min_val = data.map['z_0'];
        var max_val = data.map['z_0'];

        for(var i = 0; i < Object.keys(data.map).length; i++){
            data_f[i] = data.map['z_'+i];
            if(data.map['z_'+i] < min_val){
                min_val = data.map['z_'+i];
            }
            if(data.map['z_'+i] > max_val){
                max_val = data.map['z_'+i];
            }
        }

        self.heatmap_svg.selectAll('path').remove();
        self.heatmap_svg.selectAll('defs').remove();

        for(var i = 0; i < self.x_interp*self.y_interp; i++){
            self.heatmap_svg.select('rect#node_acc_'+i).remove();
            self.heatmap_svg.select('line#arrow_line_'+i).remove();
        }

        if(self.selected_map == 'MoistureNode'){
            min_val =   0.0;
            max_val = 60.0;
            self.calibration_svg.append('rect')
                .attr('id', 'calib_rect')
                .attr('width', self.svgWidth)
                .attr('height', 20)
                .style('fill', 'url(#svgGradient_normal)');
        }
        else if(self.selected_map == 'TemperatureNode'){
            min_val =  0.0;
            max_val = 30.0;
            self.calibration_svg.append('rect')
                .attr('id', 'calib_rect')
                .attr('width', self.svgWidth)
                .attr('height', 20)
                .style('fill', 'url(#svgGradient_inverted)');
        }
        else if(self.selected_map == 'AccelerationNode' || self.selected_map == 'ElevationNode' || self.selected_map == 'AzimuthNode'){
            min_val =  0.0;
            max_val = 60.0;
            self.calibration_svg.append('rect')
                .attr('id', 'calib_rect')
                .attr('width', self.svgWidth)
                .attr('height', 17)
                .style('fill', 'url(#svgGradient_inverted)');
        }

        $('#less').text(min_val.toFixed(2) + '')
        $('#more').text(max_val.toFixed(2) + '')

        if(self.selected_map == 'AccelerationNode' || self.selected_map == 'ElevationNode' || self.selected_map == 'AzimuthNode'){
            var defs = self.heatmap_svg.append('svg:defs')
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
            var rect_w = self.svgWidth/self.x_elements
            var rect_h = self.svgHeight/self.y_elements
            var thresholds = d3.range(0.0, 60.0);
            var color = d3.scaleLinear()
                .domain(d3.extent(thresholds))
                .interpolate(function() { return self.invert_scheme;});
            for(var i = 0; i < self.x_elements; i++){
                for(var j = 0; j < self.y_elements; j++){
                    var force = data.nodes['node_'+(i+self.x_elements*j)]['AccelerationNode']
                    var elev = data.nodes['node_'+(i+self.x_elements*j)]['ElevationNode']
                    var azim = data.nodes['node_'+(i+self.x_elements*j)]['AzimuthNode'] * Math.PI/180.0
                    self.heatmap_svg.append('rect')
                        .attr('id', 'node_acc_'+(i+self.x_elements*j))
                        .attr('x', rect_w*i)
                        .attr('y', rect_h*j)
                        .attr('width', rect_w)
                        .attr('height', rect_h)
                        .attr('fill', color(Math.abs(elev)))
                    self.heatmap_svg.append('line')
                        .attr('id', 'arrow_line_'+(i+self.x_elements*j))
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
        else if(self.selected_map == 'MoistureNode'){
            var off_th = 50.9;
            var epsilon = 0.5;
            var thresholds = d3.range(min_val, max_val);
            var thresholds2 = d3.range(off_th-epsilon, off_th+epsilon);

            var color = d3.scaleLinear()
                .domain(d3.extent(thresholds))
                .interpolate(function() { return d3.interpolateSpectral; });

            var contours = d3.contours()
                .size([self.x_interp, self.y_interp])
                .thresholds(thresholds);

            var contours2 = d3.contours()
                .size([self.x_interp, self.y_interp])
                .thresholds(thresholds2);

            var path_tmp = self.heatmap_svg.selectAll('path');

            path_tmp.data(contours(data_f))
                .enter().append('path')
                .attr('d', d3.geoPath(d3.geoIdentity().scale(self.svgWidth / self.x_interp)))
                .attr('fill', function(d) { return color(d.value); })

            path_tmp.data(contours2(data_f))
                .enter().append('path')
                .attr('d', d3.geoPath(d3.geoIdentity().scale(self.svgWidth  / self.x_interp)))
                .attr('stroke', 'black')
                .attr('stroke-width', 5)
                .attr('fill', 'none')

            path_tmp.data(contours2(data_f))
                .enter().append('path')
                .attr('class', 'blink_me')
                .attr('d', d3.geoPath(d3.geoIdentity().scale(self.svgWidth  / self.x_interp)))
                .attr('stroke', 'none')
                .attr('fill', 'rgba(0, 0, 255, 0.75)')
        }
        else{
            var thresholds = d3.range(min_val, max_val);
            var color = d3.scaleLinear()
                .domain(d3.extent(thresholds))
                .interpolate(function() { return self.invert_scheme; });
            var contours = d3.contours()
                .size([self.x_interp, self.y_interp])
                .thresholds(thresholds);
            self.heatmap_svg.selectAll('path')
                .data(contours(data_f))
                .enter().append('path')
                .attr('d', d3.geoPath(d3.geoIdentity().scale(self.svgWidth / self.x_interp)))
                .attr('fill', function(d) { return color(d.value); });
        }

        for(var i = 0; i < self.x_elements*self.y_elements; i++){
            self.heatmap_svg.select('rect#node_'+i).moveToFront();
        }
        d3.select('#tip_rect').moveToFront();
        d3.select('#tip_text').moveToFront();
        d3.select('#tip_line').moveToFront();
        d3.select('#tip_circle').moveToFront();
    }

    invert_scheme(d){
        return d3.interpolateSpectral(1-d);
    };
}

class Timedata{

    constructor(dom_elements, dimensions, margin){
        this.timedata_svg = d3.select(dom_elements.timedata_name);
        this.dataselection_name = dom_elements.dataselection_name;
        this.selected_map = dom_elements.selected_map;
        this.margin = margin;
        if(dimensions.width - margin.left - margin.right <= dimensions.height - margin.top - margin.bottom){
            this.svgWidth = dimensions.width - margin.left - margin.right;
            this.svgHeight = dimensions.width - margin.top - margin.bottom;
        }
        else{
            this.svgWidth = dimensions.height - margin.left - margin.right;
            this.svgHeight = dimensions.height - margin.top - margin.bottom;
        }
    }

    initializeSerie(data, data_format){
        var self = this;

        self.timedata_svg.attr('width', self.svgWidth + self.margin.left + self.margin.right);
        self.timedata_svg.attr('height', self.svgHeight + self.margin.top + self.margin.bottom);

        var g = self.timedata_svg.append('g')
        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')'
        );

        var x = d3.scaleTime().rangeRound([0, self.svgWidth - 50]);
        var y = d3.scaleLinear().rangeRound([self.svgHeight, 0]);

        var line = d3.line()
            .x(function(d){ return x(d.date) })
            .y(function(d){ return y(d.value) });

        x.domain(d3.extent(data, function(d){ return d.date }));
        y.domain(d3.extent(data, function(d){ return d.value }));

        g.append('g')
        .attr('class', 'grid')
        .call(d3.axisBottom(x).ticks(10)
            .tickSize(self.svgHeight)
            .tickFormat('')
        );

        g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).ticks(5)
            .tickSize(-(self.svgWidth-50))
            .tickFormat('')
        );

        g.append('g')
        .attr('class', 'white_axis')
        .attr('transform', 'translate(0,' + self.svgHeight + ')')
        .call(d3.axisBottom(x))

        g.append('g')
        .attr('class', 'white_axis')
        .call(d3.axisBottom(x))
        .attr('stroke-width', 2)
        .selectAll('text')
        .remove()

        g.append('g')
        .attr('class', 'white_axis')
        .attr('transform', 'translate(' + parseInt(self.svgWidth - 50) + ', 0)')
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
        .text($(self.dataselection_name).val() +' [' + data_format.units[self.selected_map] +']');
    }

    drawChart(data_unparsed, data_format) {

        var dx_tip = -50;
        var dy_tip = 30;

        var self = this;

        var data = [];
        for(var i = 0; i < data_unparsed.length; i++) {
            data.push(
            {
                date: new Date(data_unparsed[i]['date']),
                value: data_unparsed[i]['value']
            })
        }

        self.timedata_svg.selectAll('*').remove();

        var g = self.timedata_svg.append('g')
            .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')');

        var x = d3.scaleTime().rangeRound([0, self.svgWidth - 50]);
        var y = d3.scaleLinear().rangeRound([self.svgHeight, 0]);

        var line = d3.line()
            .x(function(d){ return x(d.date) })
            .y(function(d){ return y(d.value) });

        x.domain(d3.extent(data, function(d){ return d.date }));
        y.domain(d3.extent(data, function(d){ return d.value }));

        g.append('g')
        .attr('class', 'grid')
        .call(d3.axisBottom(x).ticks(10)
            .tickSize(self.svgHeight)
            .tickFormat('')
        );

        g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).ticks(5)
            .tickSize(-(self.svgWidth-50))
            .tickFormat('')
        );

        g.append('g')
        .attr('class', 'white_axis')
        .attr('transform', 'translate(0,' + self.svgHeight + ')')
        .call(d3.axisBottom(x))

        g.append('g')
        .attr('class', 'white_axis')
        .call(d3.axisBottom(x))
        .attr('stroke-width', 2)
        .selectAll('text')
        .remove()

        g.append('g')
        .attr('class', 'white_axis')
        .attr('transform', 'translate(' + parseInt(self.svgWidth - 50) + ', 0)')
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
        .text($(self.dataselection_name).val() +' [' + data_format.units[self.selected_map] +']');

        g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 2)
        .attr('d', line);

        self.timedata_svg.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', function(d){ return x(d.date) + self.margin.left })
        .attr('cy', function(d){ return y(d.value) + self.margin.top })
        .attr('r', 5)
        .attr('opacity', 0.0)
        .on('mouseover', function(d){
            var x_t = d3.select(this).attr('cx')
            var y_t = d3.select(this).attr('cy')
            var w = d3.select(this).attr('r')
            var h = d3.select(this).attr('r')
            var cx = parseInt(x_t)+parseInt(w)/2
            var cy = parseInt(y_t)+parseInt(h)/2
            var dx = cx+dx_tip
            var dy = cy-dy_tip
            var asdf = new Date(d.date)
            self.timedata_svg.append('rect')
                .attr('id', 'tip_rect')
                .attr('x', parseInt(x_t)-70)
                .attr('y', parseInt(y_t)-60)
                .attr('width', 140)
                .attr('height', 40)
                .attr('fill', 'black')
                .attr('opacity', 0.7)
                .style('pointer-events','none');
            self.timedata_svg.append('text')
                .attr('id', 'tip_text_date')
                .text(''+asdf.getDate()+'/'+(asdf.getMonth()+1)+'/'+asdf.getFullYear()+'-'+('0' + asdf.getHours()).slice(-2)+':'+('0' + asdf.getMinutes()).slice(-2))
                .attr('text-anchor', 'end')
                .attr('x', parseInt(x_t)+68)
                .attr('y', parseInt(y_t)-45)
                .attr('fill', 'white')
                .attr('font-size', '16px')
                .style('pointer-events','none');
            self.timedata_svg.append('text')
                .attr('id', 'tip_text_value')
                .text(''+d.value.toFixed(3) + data_format.units[self.selected_map])
                .attr('text-anchor', 'end')
                .attr('x', parseInt(x_t)+68)
                .attr('y', parseInt(y_t)-25)
                .attr('fill', 'white')
                .attr('font-size', '16px')
                .style('pointer-events','none');
            self.timedata_svg.append('line')
                .attr('id', 'tip_line')
                .attr('x1', x_t)
                .attr('y1', y_t)
                .attr('x2', parseInt(x_t)-70)
                .attr('y2', parseInt(y_t)-20)
                .attr('stroke-width', 1)
                .attr('stroke', 'red')
                .style('pointer-events','none');
            self.timedata_svg.append('circle')
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
}