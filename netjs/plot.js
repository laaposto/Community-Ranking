sigma.utils.pkg('sigma.canvas.nodes');
sigma.canvas.nodes.image = (function () {
    var _cache = {},
        _loading = {},
        _callbacks = {};

    var renderer = function (node, context, settings) {
        var args = arguments,
            prefix = settings('prefix') || '',
            size = node[prefix + 'size'],
            color = node.color || settings('defaultNodeColor'),
            url = node.url;

        if (_cache[url]) {
            context.save();

            // Draw the clipping disc:
            context.beginPath();
            context.arc(
                node[prefix + 'x'],
                node[prefix + 'y'],
                node[prefix + 'size'],
                0,
                Math.PI * 2,
                true
            );
            context.closePath();
            context.clip();

            // Draw the image
            context.drawImage(
                _cache[url],
                node[prefix + 'x'] - size,
                node[prefix + 'y'] - size,
                2 * size,
                2 * size
            );

            // Quit the "clipping mode":
            context.restore();

            // Draw the border:
            context.beginPath();
            context.arc(
                node[prefix + 'x'],
                node[prefix + 'y'],
                node[prefix + 'size'],
                0,
                Math.PI * 2,
                true
            );
            context.lineWidth = size / 8;
            context.strokeStyle = node.color || settings('defaultNodeColor');
            context.stroke();
        } else {
            sigma.canvas.nodes.image.cache(url);
            sigma.canvas.nodes.def.apply(
                sigma.canvas.nodes,
                args
            );
        }
    };

    renderer.cache = function (url, callback) {
        if (callback)
            _callbacks[url] = callback;

        if (_loading[url])
            return;

        var img = new Image();

        img.onload = function () {
            _loading[url] = false;
            _cache[url] = img;

            if (_callbacks[url]) {
                _callbacks[url].call(this, img);
                delete _callbacks[url];
            }
        };

        _loading[url] = true;
        img.src = url;
    };

    return renderer;
})();


sigma.classes.graph.addMethod('neighbors', function (nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
        neighbors[k] = this.nodesIndex[k];

    return neighbors;
});

var s, s2,
    N,
    C,
    datag,
    timeclick,
    clickeduser,
    clickedavatar,
    flag = 0,
    bigger = 0,
    end,
    start,
    myinter,
    comclick,
    urls = [],
    labels = [],
    locations = [],
    tweets = [],
    description = [],
    following = [],
    followers = [],
    username = [],
    sizesnow = [],
    nowx = [],
    nowy = [],
    indexes = [];
var g1, myinterval;

window.onload = function () {
    g1 = new JustGage({
        id: "gauge",
        value: 50,
        min: 0,
        max: 100,
        title: "Connections Percentage",
        label: "% of total",
        levelColors: [
            "#00fff6",
            "#5d9fd2",
            "#0089ff"
        ]
    });
    var $g1 = $('#gauge').find('svg text');
    $g1.eq(0).attr('y', '12');
    $g1.eq(1).attr('y', '10');
    $g1.eq(2).attr('y', '7');
    $g1.eq(3).attr('y', '5');
    $g1.eq(4).attr('y', '5');
    myinterval = setInterval(function () {
        g1.refresh(50);
    }, 1500);
};

function createnet(com, timeslot) {
    bigger = 0;
    urls.length = 0;
    labels.length = 0;
    locations.length = 0;
    description.length = 0;
    tweets.length = 0;
    following.length = 0;
    followers.length = 0;
    username.length = 0;
    sizesnow.length = 0;
    nowx.length = 0;
    nowy.length = 0;
    start = 0;
    end = 0;
    indexes.length = [];
    $('.dropdown').hide(500);
    var o,
        E,
        allcon = 0,
        g = {
            nodes: [],
            edges: []
        };
    timeclick = timeslot;
    comclick = com;

    $.ajax({
        type: "GET",
        url: "jsons/" + colname + "users" + comclick + ".json",
        dataType: "json",
        success: function (data) {
            datag = data;
            N = data.datasetInfo.allUsernames.length;
            E = data.connections[timeclick].timestamp_connections.length;
            C = data.connections.length;


            for (var i = 0; i < C; i++) {
                indexes.push(centrality[comclick - 1][i]);
            }
            for (var i = 0; i < C; i++) {
                if (indexes[i] !== 0) {
                    start = i;
                    break
                }
            }
            for (var i = C - 1; i >= 0; i--) {
                if (indexes[i] !== 0) {
                    end = i;
                    break
                }
            }

            if (timeclick === start) {
                $('#prev').hide(500);
            }
            if (timeclick === end) {
                $('#next').hide(500);
            }
            if ((timeclick > start) && (timeclick < end)) {
                $('#next').show(500);
                $('#prev').show(500);
            }

            for (var i = 0; i < data.datasetInfo.allUsernames.length; i++) {
                if (data.datasetInfo.allUsernames[i].avatar === "") {
                    urls.push('imgs/noprofile.gif');
                }
                else {
                    urls.push("https://twitter.com/" + data.datasetInfo.allUsernames[i].screen_name + "/profile_image?size=normal");
                }

                if (data.datasetInfo.allUsernames[i].screen_name === "") {
                    labels.push('-');
                }
                else {
                    labels.push(data.datasetInfo.allUsernames[i].screen_name);
                }

                if (data.datasetInfo.allUsernames[i].location === "") {
                    locations.push('Unkown');
                }
                else {
                    locations.push(data.datasetInfo.allUsernames[i].location);
                }

                if (data.datasetInfo.allUsernames[i].name === "") {
                    username.push('-');
                }
                else {
                    username.push(data.datasetInfo.allUsernames[i].name);
                }

                var desc = data.datasetInfo.allUsernames[i].description;
                if (desc) {
                    if (desc.length > 40) {
                        desc = desc.substring(0, 37) + "...";
                    }
                }
                else {
                    desc = "None";
                }
                description.push(desc);

                if (data.datasetInfo.allUsernames[i].friends_count === "") {
                    following.push(0);
                }
                else {
                    following.push(data.datasetInfo.allUsernames[i].friends_count);
                }

                if (data.datasetInfo.allUsernames[i].followers_count === "") {
                    followers.push(0);
                }
                else {
                    followers.push(data.datasetInfo.allUsernames[i].followers_count);
                }

                if (data.datasetInfo.allUsernames[i].statuses_count === "") {
                    tweets.push(0);
                }
                else {
                    tweets.push(data.datasetInfo.allUsernames[i].statuses_count);
                }

                sizesnow.push(0);
            }


            for (i = 0; i < E; i++) {
                var con = data.connections[timeclick].timestamp_connections[i].split(';');
                allcon += 1 * con[2];
                for (var j = 0; j < data.datasetInfo.allUsernames.length; j++) {

                    if (data.connections[timeclick].timestamp_connections[i].indexOf(labels[j]) > -1) {
                        sizesnow[j] = sizesnow[j] + 1 * con[2];
                    }

                }
                g.edges.push({
                    id: 'e' + i,
                    source: 'n' + labels.indexOf(con[0]),
                    target: 'n' + labels.indexOf(con[1]),
                    size: con[2],
                    type: "curvedArrow"

                });
            }

            if (E !== 0) {
                for (i = 0; i < N; i++) {
                    nowx[i] = Math.random();
                    nowy[i] = Math.random();
                    o = {
                        id: 'n' + i,
                        label: labels[i],
                        type: 'image',
                        url: urls[i],
                        x: nowx[i],
                        y: nowy[i],
                        size: sizesnow[i],
                        color: '#5d9fd2',
                        username: username[i],
                        description: description[i],
                        following: following[i],
                        followers: followers[i],
                        locations: locations[i],
                        tweets: tweets[i]
                    };
                    g.nodes.push(o);

                    if (sizesnow[i] > 0) {
                        bigger++;
                    }
                }
            }
            sigma.renderers.def = sigma.renderers.canvas;
            s = new sigma({
                graph: g,
                renderer: {
                    container: document.getElementById('selection_network'),
                    type: 'canvas'
                }, settings: {
                    animationsTime: 1000,
                    minNodeSize: 8,
                    maxNodeSize: 25
                }
            });

            s.graph.nodes().forEach(function (node) {
                if (node.size === 0) {
                    node.hidden = true;
                }
            });

            if ($('#expand').is(":visible")) {
                s.graph.nodes().forEach(function (node) {
                    if (node.size === 1) {
                        node.hidden = true;
                    }
                });
            }
            else {
                s.graph.nodes().forEach(function (node) {
                    if (node.size === 1) {
                        node.hidden = false;
                    }
                });
            }


            s.refresh();

            s.graph.nodes().forEach(function (n) {
                n.originalColor = n.color;
            });
            s.graph.edges().forEach(function (e) {
                e.originalColor = e.color;
            });

            s.bind('clickNode', function (e) {

                g1.refresh((((e.data.node.size) * 100) / allcon).toFixed(2));
                clearInterval(myinterval);
                myinterval = setInterval(function () {
                    g1.refresh((((e.data.node.size) * 100) / allcon).toFixed(2));
                }, 500);
                $(".user-profile").show(500);
                $(".bio").text("@" + e.data.node.label);
                $(".avatar").attr('src', e.data.node.url);
                $("#info_photo img").attr('src', e.data.node.url);
                $("#info_user").text("@" + e.data.node.label);
                $("#user_page").attr('href', 'https://twitter.com/' + e.data.node.label);
                $("#user_link").attr('href', 'https://twitter.com/' + e.data.node.label);
                $(".username").text(e.data.node.username);
                $("#info_name").text(e.data.node.username);
                $(".description").text(e.data.node.description);
                $("#info_desc").text(e.data.node.description);
                $(".data li").eq(1).html('<span>' + e.data.node.following + '</span><p>Following</p>');
                $("#info_following").html('<span>' + e.data.node.following + '</span><br><span>Following</span>');
                $(".data li").eq(2).html('<span>' + e.data.node.followers + '</span><p>Followers</p>');
                $("#info_followers").html('<span>' + e.data.node.followers + '</span><br><span>Followers</span>');
                $(".data li").eq(0).html('<span>' + e.data.node.tweets + '</span><p>Tweets</p>');
                $("#info_tweets").html('<span>' + e.data.node.tweets + '</span><br><span>Tweets</span>');
                $("#info_loc").html('<img src="imgs/location.png" alt="error">' + e.data.node.locations);


                var nodeId = e.data.node.id,
                    toKeep = s.graph.neighbors(nodeId);
                toKeep[nodeId] = e.data.node;

                s.graph.nodes().forEach(function (n) {
                    if (toKeep[n.id])
                        n.color = n.originalColor;
                    else
                        n.color = '#eee';
                });

                s.graph.edges().forEach(function (e) {
                    if (toKeep[e.source] && toKeep[e.target])
                        e.color = e.originalColor;
                    else
                        e.color = '#eee';
                });
                s.refresh();
            });


            s.bind('clickStage', function (e) {
                $(".user-profile").hide(1000);
                s.graph.nodes().forEach(function (n) {
                    n.color = n.originalColor;
                });

                s.graph.edges().forEach(function (e) {
                    e.color = e.originalColor;
                });

                s.refresh();
            });
            myinter = setInterval(function () {
                s.refresh();
            }, 1500);
            s.startForceAtlas2();
        },
        async: false
    });
}

function animate(direction) {
    jQuery(".user-profile").hide(1000);
    clearInterval(myinter);

    s.killForceAtlas2();
    s.graph.nodes().forEach(function (node, index) {
        nowx[index] = node.x;
        nowy[index] = node.y;
    });

    bigger = 0;
    $('#selection_network').html('');
    var o,
        E,
        allcon = 0,
        sizesnxt = [],
        g = {
            nodes: [],
            edges: []
        };
    if (direction === -2) {
        do {
            timeclick--;
            if (timeclick === start) {
                $('#prev').hide(500);
                break;
            }
        } while ((indexes[timeclick] === 0));
        $('#next').show(500);


    }
    else if (direction === -1) {
        do {
            timeclick++;
            if (timeclick === end) {
                $('#next').hide(500);
                break;
            }
        } while ((indexes[timeclick] === 0));
        $('#prev').show(500);

    }
    else {
        timeclick = direction;
    }

    if (timeclick === start) {
        $('#prev').hide(500);
        $('#next').show(500);
    }
    if (timeclick === end) {
        $('#next').hide(500);
        $('#prev').show(500);
    }
    if ((timeclick > start) && (timeclick < end)) {
        $('#next').show(500);
        $('#prev').show(500);
    }

    $('#navigation_chart .nv-lineChart circle.nv-point').attr("fill", "#B5B5B5");
    $('#navigation_chart .nv-scatterWrap .nv-groups .nv-series-0 .nv-point-' + timeclick).attr("fill", "#ff0000");

    $.ajax({
        type: "GET",
        url: "jsons/" + colname + "users" + comclick + ".json",
        dataType: "json",
        success: function (data) {

            E = data.connections[timeclick].timestamp_connections.length;

            for (var i = 0; i < N; i++) {
                sizesnxt.push(0);
            }

            for (i = 0; i < E; i++) {
                var con = data.connections[timeclick].timestamp_connections[i].split(';');
                allcon += 1 * con[2];
                for (var j = 0; j < N; j++) {

                    if (data.connections[timeclick].timestamp_connections[i].indexOf(labels[j]) > -1) {
                        sizesnxt[j] = sizesnxt[j] + 1 * con[2];
                    }
                }

                g.edges.push({
                    id: 'e' + i,
                    source: 'n' + labels.indexOf(con[0]),
                    target: 'n' + labels.indexOf(con[1]),
                    size: con[2],
                    type: "curvedArrow"
                });
            }

            if (E !== 0) {

                for (i = 0; i < N; i++) {

                    o = {
                        id: 'n' + i,
                        label: labels[i],
                        type: 'image',
                        url: urls[i],
                        now1_x: nowx[i],
                        now1_y: nowy[i],
                        now1_size: sizesnow[i],
                        now1_color: '#5d9fd2',
                        now2_x: nowx[i],
                        now2_y: nowy[i],
                        now2_size: sizesnxt[i],
                        now2_color: '#5d9fd2',
                        username: username[i],
                        description: description[i],
                        following: following[i],
                        followers: followers[i],
                        locations: locations[i],
                        tweets: tweets[i]
                    };

                    ['x', 'y', 'size', 'color'].forEach(function (val) {
                        o[val] = o['now1_' + val];
                    });

                    g.nodes.push(o);

                    if (sizesnxt[i] > 0) {
                        bigger++;
                    }
                }
            }


            if (s) {
                s.graph.clear();
                s.graph.kill();
            }
            s = new sigma({
                graph: g,
                renderer: {
                    container: document.getElementById('selection_network'),
                    type: 'canvas'
                }, settings: {
                    animationsTime: 1000,
                    minNodeSize: 8,
                    maxNodeSize: 25
                }
            });
            setTimeout(function () {
                s.graph.nodes().forEach(function (node, index) {
                    if (sizesnxt[index] === 0) {
                        node.hidden = true;
                    }
                });


            }, 900);

            s.graph.nodes().forEach(function (node, index) {
                if ((sizesnxt[index] === 0) && (sizesnow[index] === 0)) {
                    node.hidden = true;
                }

                if ($('#expand').is(":visible")) {
                    if (sizesnxt[index] === 1) {
                        node.hidden = true;
                    }

                }
                else {
                    if (sizesnxt[index] === 1) {
                        node.hidden = false;
                    }
                }
            });

            sizesnow = sizesnxt.slice(0);

            s.graph.nodes().forEach(function (n) {
                n.originalColor = n.color;
            });
            s.graph.edges().forEach(function (e) {
                e.originalColor = e.color;
            });

            s.bind('clickNode', function (e) {
                g1.refresh((((e.data.node.size) * 100) / allcon).toFixed(2));
                clearInterval(myinterval);
                myinterval = setInterval(function () {
                    g1.refresh((((e.data.node.size) * 100) / allcon).toFixed(2));
                }, 500);
                $(".user-profile").show(500);

                $(".bio").text("@" + e.data.node.label);
                $(".avatar").attr('src', e.data.node.url);
                $("#info_photo img").attr('src', e.data.node.url);
                $("#info_user").text("@" + e.data.node.label);
                $("#user_page").attr('href', 'https://twitter.com/' + e.data.node.label);
                $("#user_link").attr('href', 'https://twitter.com/' + e.data.node.label);
                $(".username").text(e.data.node.username);
                $("#info_name").text(e.data.node.username);
                $(".description").text(e.data.node.description);
                $("#info_desc").text(e.data.node.description);
                $(".data li").eq(1).html('<span>' + e.data.node.following + '</span><p>Following</p>');
                $("#info_following").html('<span>' + e.data.node.following + '</span><br><span>Following</span>');
                $(".data li").eq(2).html('<span>' + e.data.node.followers + '</span><p>Followers</p>');
                $("#info_followers").html('<span>' + e.data.node.followers + '</span><br><span>Followers</span>');
                $(".data li").eq(0).html('<span>' + e.data.node.tweets + '</span><p>Tweets</p>');
                $("#info_tweets").html('<span>' + e.data.node.tweets + '</span><br><span>Tweets</span>');
                $("#info_loc").html('<img src="imgs/location.png" alt="error">' + e.data.node.locations);

                var nodeId = e.data.node.id,
                    toKeep = s.graph.neighbors(nodeId);
                toKeep[nodeId] = e.data.node;

                s.graph.nodes().forEach(function (n) {
                    if (toKeep[n.id])
                        n.color = n.originalColor;
                    else
                        n.color = '#eee';
                });

                s.graph.edges().forEach(function (e) {
                    if (toKeep[e.source] && toKeep[e.target])
                        e.color = e.originalColor;
                    else
                        e.color = '#eee';
                });
                s.refresh();
            });

            s.bind('clickStage', function (e) {
                $(".user-profile").hide(1000);
                s.graph.nodes().forEach(function (n) {
                    n.color = n.originalColor;
                });

                s.graph.edges().forEach(function (e) {
                    e.color = e.originalColor;
                });

                s.refresh();
            });
            myinter = setInterval(function () {
                s.refresh();
            }, 1500);

            setTimeout(function () {
                s.startForceAtlas2();
            }, 2000);

            var prefix = 'now2_';
            sigma.plugins.animate(
                s,
                {
                    x: prefix + 'x',
                    y: prefix + 'y',
                    size: prefix + 'size',
                    color: prefix + 'color'
                }
            );
            s.refresh();
        },
        async: false
    });
}


$("#back").click(function () {

    clearInterval(myinter);
    s.killForceAtlas2();
    $('#selection_wrapper').stop().animate({"opacity": 0}, 1000, function () {
        $('#selection_network').html('');
        $(".user-profile").hide(1000);
    });
    $('#main_chart').show();
    $('.dropdown').show(500);
    $('#navigation_chart').html('<svg></svg>');
    $('#main_chart').stop().animate({"opacity": 1}, 1000, function () {

    });
});

$("#prev, #next").click(function () {
    if ($(this).attr('id') === "next") {
        animate(-1);
    }
    else {
        animate(-2);
    }
});

$("#close_user").click(function () {
    $(".user-profile").hide(1000);
});
$("#closeconve").click(function () {
    $('#conve').stop().slideToggle();
    var vague = $("#myModal2").Vague({intensity: 0});
    vague.blur();
    $('#overlay').hide();
    $('#vague-svg-blur').remove();
});
$("#overlay").click(function () {
    $('#conve').stop().slideToggle();
    var vague = $("#myModal2").Vague({intensity: 0});
    vague.blur();
    $('#overlay').hide();
    $('#vague-svg-blur').remove();
});

$("#more").click(function () {
    $('#myModal2').reveal();
    $('#info_network').html('');
    $('#info_barchart').html('<svg></svg>');

    var o,
        E,
        sizesnowin = [],
        namesgraph = [],
        sizecon = [],
        g = {
            nodes: [],
            edges: []
        };

    E = datag.connections[timeclick].timestamp_connections.length;

    for (var i = 0; i < N; i++) {

        sizesnowin.push(0);
        sizecon.push(0);
    }

    var username = $(".bio").text().substring(1);
    var direct;
    for (var i = 0; i < E; i++) {
        var con = datag.connections[timeclick].timestamp_connections[i].split(';');

        if (datag.connections[timeclick].timestamp_connections[i].indexOf(username) > -1) {
            if (con[1] === username) {
                direct = "#5d9fd2";
            }
            else {
                direct = "#2ca02c"
            }
            g.edges.push({
                id: 'e' + i,
                source: 'n' + labels.indexOf(con[0]),
                target: 'n' + labels.indexOf(con[1]),
                size: con[2],
                color: direct,
                type: "curvedArrow"
            });

            sizesnowin[labels.indexOf(con[0])] = sizesnowin[labels.indexOf(con[0])] + 1 * con[2];
            sizesnowin[labels.indexOf(con[1])] = sizesnowin[labels.indexOf(con[1])] + 1 * con[2];

        }
    }

    for (i = 0; i < N; i++) {

        o = {
            id: 'n' + i,
            label: labels[i],
            type: 'image',
            url: urls[i],
            x: Math.random(),
            y: Math.random(),
            size: sizesnowin[i],
            color: '#5d9fd2'
        };
        g.nodes.push(o);

    }

    s2 = new sigma({
        graph: g,
        renderer: {
            container: document.getElementById('info_network'),
            type: 'canvas'
        }, settings: {
            animationsTime: 1000,
            minNodeSize: 8,
            maxNodeSize: 25
        }
    });
    s2.graph.nodes().forEach(function (node) {
        if (node.size === 0) {
            node.hidden = true;
        }
    });
    s2.refresh();

    s2.graph.nodes().forEach(function (n) {
        n.originalColor = n.color;
    });
    s2.graph.edges().forEach(function (e) {
        e.originalColor = e.color;
    });

    s2.bind('clickNode', function (e) {

        var nodeId = e.data.node.id,
            toKeep = s2.graph.neighbors(nodeId);
        toKeep[nodeId] = e.data.node;

        s2.graph.nodes().forEach(function (n) {
            if (toKeep[n.id])
                n.color = n.originalColor;
            else
                n.color = '#eee';
        });

        s2.graph.edges().forEach(function (e) {
            if (toKeep[e.source] && toKeep[e.target])
                e.color = e.originalColor;
            else
                e.color = '#eee';
        });

        s2.refresh();
        if (e.data.node.label === username) {
            d3.selectAll(".nv-series-0 .nv-bar").attr('style', 'fill: rgb(93, 159, 210);stroke: rgb(93, 159, 210);');
            d3.selectAll(".nv-series-1 .nv-bar").attr('style', 'fill: rgb(44, 160, 44);stroke: rgb(44, 160, 44);');

        }
        else {

            clickeduser = e.data.node.label;
            d3.selectAll(".nv-series-0 .nv-bar").attr('style', 'fill: rgb(93, 159, 210);stroke: rgb(93, 159, 210);');
            d3.selectAll(".nv-series-1 .nv-bar").attr('style', 'fill: rgb(44, 160, 44);stroke: rgb(44, 160, 44);');
            $(".nv-series-0").children().eq(namesgraph.indexOf(e.data.node.label)).attr('style', 'fill: #ff0000;stroke: #ff0000;');
            $(".nv-series-1").children().eq(namesgraph.indexOf(e.data.node.label)).attr('style', 'fill: #ff0000;stroke: #ff0000;');
        }

    });

    s2.bind('clickStage', function (e) {
        s2.graph.nodes().forEach(function (n) {
            n.color = n.originalColor;
        });

        s2.graph.edges().forEach(function (e) {
            e.color = e.originalColor;
        });

        // Same as in the previous event:
        s2.refresh();

        d3.selectAll(".nv-series-0 .nv-bar").attr('style', 'fill: rgb(93, 159, 210);stroke: rgb(93, 159, 210);');
        d3.selectAll(".nv-series-1 .nv-bar").attr('style', 'fill: rgb(44, 160, 44);stroke: rgb(44, 160, 44);');

    });
    s2.killForceAtlas2();
    s2.startForceAtlas2();


    var values = [];
    var values2 = [];
    var name;
    var itemAmount = 0;
    var itemAmount2 = 0;

    for (var i = 0, j = 0; i < N; i++) {
        if (sizesnowin[i] > 0) {

            if (labels[i] !== username) {
                namesgraph[j] = labels[i];
                j++;
                if (labels[i].length > 8) {
                    name = labels[i].substring(0, 8) + "..";
                }
                else {
                    name = labels[i];
                }
                itemAmount = 0;
                itemAmount2 = 0;

                for (var k = 0; k < E; k++) {

                    var con = datag.connections[timeclick].timestamp_connections[k].split(';');

                    if ((datag.connections[timeclick].timestamp_connections[k].indexOf(labels[i]) > -1) && (datag.connections[timeclick].timestamp_connections[k].indexOf(username) > -1)) {

                        if (con[1] === username) {
                            itemAmount2 = itemAmount2 + 1 * con[2];
                        }
                        else {
                            itemAmount = itemAmount + 1 * con[2];
                        }
                    }

                }
                values.push({x: name, y: itemAmount2, realname: labels[i], takis: itemAmount});
                values2.push({x: name, y: itemAmount, realname: labels[i]});

            }
        }
    }
    var data = [{
        values: values,
        key: "IN",
        color: "#5d9fd2"
    },
        {
            values: values2,
            key: "OUT",
            color: "#2ca02c"
        }];

    nv.addGraph(function () {
        var chart = nv.models.multiBarChart()
                .tooltips(true)
                .stacked(true).showControls(false)
                .duration(1300)
                .groupSpacing(0.05)
                .reduceXTicks(false)
                .margin({bottom: 80})
                .tooltipContent(function (key, x, y, realname) {
                    if (realname.point.series === 0) {
                        return '<h3><img class="toolimg" src="' + urls[labels.indexOf(realname.point.realname)] + '" onError="this.src=\'imgs/noprofile.gif\';"/><p>' + realname.point.realname + '</p></h3>' + '<p>In:  ' + realname.point.y + '</p>' + '<p>Out:  ' + realname.point.takis + '</p>';
                    }
                    else {
                        return '<h3><img class="toolimg" src="' + urls[labels.indexOf(realname.point.realname)] + '" onError="this.src=\'imgs/noprofile.gif\';"/><p>' + realname.point.realname + '</p></h3>' + '<p>In:  ' + realname.point.y0 + '</p>' + '<p>Out:  ' + realname.point.y + '</p>';
                    }
                })
            ;


        chart.yAxis.tickFormat(d3.format('d'));

        var svg = d3.select('#info_barchart svg')
            .datum(data)
            .call(chart);


        for (var property in chart.legend.dispatch) {
            chart.legend.dispatch[property] = function () {
            };
        }

        return chart;
    }, function () {

        d3.selectAll(".nv-bar").on('click',
            function (e) {
                d3.selectAll(".nv-series-0 .nv-bar").attr('style', 'fill: rgb(93, 159, 210);stroke: rgb(93, 159, 210);');
                d3.selectAll(".nv-series-1 .nv-bar").attr('style', 'fill: rgb(44, 160, 44);stroke: rgb(44, 160, 44);');
                $('.nv-series-0 .nv-bar').eq($(this).index()).attr('style', 'fill: #ff0000;stroke: #ff0000;');
                $('.nv-series-1 .nv-bar').eq($(this).index()).attr('style', 'fill: #ff0000;stroke: #ff0000;');

                clickeduser = e.realname;
                s2.graph.nodes().forEach(function (n) {
                    if (n.label === e.realname) {

                        var nodeId = n.id,
                            toKeep = s2.graph.neighbors(nodeId);
                        toKeep[nodeId] = n;

                        s2.graph.nodes().forEach(function (n) {
                            if (toKeep[n.id])
                                n.color = n.originalColor;
                            else
                                n.color = '#eee';
                        });

                        s2.graph.edges().forEach(function (e) {
                            if (toKeep[e.source] && toKeep[e.target])
                                e.color = e.originalColor;
                            else
                                e.color = '#eee';
                        });
                        s2.refresh();
                    }
                });
            });
        var xTicks = d3.select('.nv-x.nv-axis > g').selectAll('g');
        xTicks
            .selectAll('text')
            .attr('transform', function (d, i, j) {
                return 'translate (-10, 33) rotate(-90 0,0)'
            })
    });
});
$("#minimize").click(function () {
    s.graph.nodes().forEach(function (node) {
        if (node.size === 1) {
            node.hidden = true;
        }
    });
    s.refresh();
    $("#minimize").hide();
    $("#expand").show();
});

$("#expand").click(function () {
    s.graph.nodes().forEach(function (node) {
        if (node.size === 1) {
            node.hidden = false;
        }
    });
    s.refresh();
    $("#minimize").show();
    $("#expand").hide();
});

$("#main_choice,#down_arrow").click(function () {
    $("#dropdown_menu").fadeToggle("fast");
});

$(document).click(function (e) {
    if ($(e.target).closest("#main_choice,#down_arrow").length > 0) {
        return false;
    }
    if ($("#dropdown_menu").is(":visible")) {
        $("#dropdown_menu").fadeToggle("fast");
    }
});

$("#dropdown_menu div:not(:first-child)").click(function () {
    var choice = $(this).html().substr(0, $(this).html().indexOf(' <i'));
    var already = $('#main_choice').text().substr(21);
    if (choice !== already) {
        $("#main_choice").text("Blobs Signify No. of " + choice);
        d3.select('#main_chart svg')
            .datum(databul());

        setTimeout(function () {
            var text = $('#main_choice').text();
            for (var i = 0; i < cumlen; i++) {
                for (var j = 0; j < timelen; j++) {
                    if (text.substr(21) === "Users") {
                        var cent = users[i][j];
                        if (cent !== 0) {
                            cent = (cent - usersmin) / (usersmax) * (9) + 1;
                        }
                        else {
                            cent = -1;
                        }
                        $('#main_chart .nv-scatterWrap .nv-groups .nv-series-' + i + ' .nv-point-' + j).attr("r", cent + 1);
                    }
                    if (text.substr(21) === "Connections") {
                        var cent = connections[i][j];
                        if (cent !== 0) {
                            cent = (cent - conmin) / (conmax) * (9) + 1;
                        }
                        else {
                            cent = -1;
                        }
                        $('#main_chart .nv-scatterWrap .nv-groups .nv-series-' + i + ' .nv-point-' + j).attr("r", cent + 1);
                    }
                    if (text.substr(21) === "Centrality") {
                        var cent = centrality[i][j];
                        if (cent !== 0) {
                            cent = (cent - centmin) / (centmax) * (9) + 1;
                        }
                        else {
                            cent = -1;
                        }
                        $('#main_chart .nv-scatterWrap .nv-groups .nv-series-' + i + ' .nv-point-' + j).attr("r", cent + 1);
                    }

                }
            }
            $('#main_chart .nv-scatterWrap .nv-groups .nv-group circle').attr("stroke-width", "3");
            $('#main_chart .nv-scatterWrap .nv-groups .nv-group circle').attr("stroke-opacity", ".3");

            d3.select('#main_chart')
                .selectAll('path.nv-line')
                .style('opacity', 0);
            $(".nv-y .nv-axisMaxMin").first().hide();
        }, 100);
    }
});