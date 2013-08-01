$(function(){
    // test options
    var points = [[0, 100],[600000,319],[1200000,346],[1800000,356],[2400000,347],[3000000,327], [4000000,100]];
    updateChart(points);

    // finally bind for request
    $('#search').click(function(){
        var start = $('#startTime').val();
        var end = $('#endTime').val();
        getData(start, end);
    });
});

/**
 * This function realize request to API
 * to get data from server
 * @param start
 * @param end
 * @todo create success and error func
 */
function getData(start, end){
    $.ajax({
        url: 'http://hits-data.eu01.aws.af.cm/data/'+start+'/'+end,
        type: 'GET',
        data: {callback: 'updateChart'},
        dataType: 'jsonp'
    });
}

/**
 * Callback function for Cross-domain request
 * @param response
 * @todo check responsive for array
 */
function updateChart(response){
    NgenixChart.update('myCanvas', response);
}

/**
 * Object which containing all functions for work with canvas
 * @type {NgenixChart}
 */
var NgenixChart = function(){
    var canvas, ctx;
    var canvasHeight = 300;
    var canvasWidth = 700;
    var margin = {top: 30, left: 50, right: 0, bottom: 50};
    var xMax = canvasWidth - (margin.left + margin.right);
    var yMax = canvasHeight - (margin.top + margin.bottom);

    var points, maxPoint;

    /**
     * General function for draw charts.
     * At first, we take canvasId and init it. Further we create background and
     * start other functions for draw charts.
     * @param canvasId
     * @param DataPiece
     */
    var render = function (canvasId, DataPiece){
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');

        points = DataPiece;
        maxPoint = getMax();

        //background
        ctx.fillStyle = 'FCFCFC';
        ctx.fillRect( 0, 0, canvasWidth, canvasHeight );

        renderBaseLines();
        renderData();
    }

    /**
     * Draw basic lines
     * x, y coordinate and labels for values
     */
    var renderBaseLines = function (){
        var yPos = 0;
        var countOfLines = 7;
        var yInc = (yMax - margin.top) / countOfLines;

        for(var i = 0; i < countOfLines; i++){
            yPos += ( i==0 ) ? margin.top : yInc;
            drawLine(margin.left, yPos, xMax + margin.left, yPos, 'E9E9E9');

            // y lables
            ctx.font = '10pt Calibri';
            var text = Math.round( maxPoint - ((i == 0)? 0 : ( maxPoint / countOfLines *i )) );
            ctx.fillStyle = '000';
            ctx.fillText(text, 10, yPos + 5);
        }


        // Draw vertical line
        drawLine(margin.left, margin.top, margin.left, yMax, '000');

        // Draw horizontal line
        drawLine(margin.left, yMax, xMax + margin.left, yMax, '000');
    }

    /**
     * Draw chart columns.
     * Output dates also located here.
     */
    var renderData = function (){
        var lineWidth = 30;
        var padding = lineWidth + (lineWidth /2);
        var xPos = margin.left + (lineWidth/2) + 10; // 10px margin from y coordinate

        for(var i = 0; i < points.length; i++){
            var count = points[i][1];
            var ratio = yMax / maxPoint;
            var barStartY = yMax - 1;
            var barEndY = count > 0 ? yMax - (count * ratio) + margin.top : barStartY;

            // draw all lines by one common function
            drawLine(xPos, barStartY, xPos, barEndY, 'FF8000', lineWidth);

            // output dates
            var date = new Date(points[i][0] * 1000);
            var txt = date.getUTCHours() + ' - ' + date.getUTCMinutes();
            var cnvHeight = canvasHeight - (margin.left + margin.right);
            ctx.save();
            ctx.translate(xPos, cnvHeight + 10); //-190, 350
            ctx.rotate(-Math.PI / 2 );
            ctx.fillText(txt, 0, 0);
            ctx.restore();

            xPos += padding;
        }
    }

    /**
     * Function for drawing lines in HTML5 Canvas
     * @param startX
     * @param startY
     * @param endX
     * @param endY
     * @param strokeStyle
     * @param lineWidth
     */
    var drawLine = function (startX, startY, endX, endY, strokeStyle, lineWidth){
        strokeStyle = strokeStyle || '000';
        lineWidth = lineWidth || 1;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo( startX, startY );
        ctx.lineTo( endX, endY );
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Get max value by DataPiece array
     * @returns {number}
     */
    var getMax = function (){
        var max = 0;
        for(var i = 0; i < points.length; i++){
            if(max < points[i][1]) max = points[i][1];
        }
        return max;
    }

    return {update: render}
}()