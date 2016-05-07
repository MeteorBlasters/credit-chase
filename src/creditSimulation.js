//sychronously posts a credit event
eventPOST = function(score, event)
{
    var event = {
        score: score,
        event: event
    }
    var ret;
    $.ajax({
        type: "POST",
        async:false,
        url: "http://ec2-52-53-177-180.us-west-1.compute.amazonaws.com/score-simulator/scoresim/simulateScore",
        contentType: 'application/json',
        dataType: "json",
        success: function (data) {
            ret = data;
        },
        error: function (err) {
            alert("endpoint post failed: " + JSON.stringify(err));
        },
        data: JSON.stringify(event)
    });
    return ret;
}