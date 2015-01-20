
// add deepcopy function to all object
Object.defineProperty(Object.prototype,"deepcopy",{
    value: function() { var ret={}; jQuery.extend(true, ret, this); return ret; },
    writable:false,
    enumerable:false,
    configurable:false
});

function popQueue() {
    if(!queue.length) {
        states["queue_timeout"] = 0;
        return;
    }
    if (states["queue_timeout"]==0) {
        states["queue_timeout"] = 48;
        
        states["enableClick"] = false;
        
        
        mat_obj = queue.pop();
        //console.debug(obj_pop);
    
        //mat_print(mat_obj["mat"]);
        //anime 1
        var mc = mat_color_add(mat_obj["mat_explode"], "#A0A0A0");
        mat_gen(mat_obj["mat_old"], mc);
        
        //anime 2
        mc = mat_color_add(mat_obj["mat_affacted"], "#E0E0E0");
        mc = mat_color_add(mat_obj["mat_explode"], "#A0A0A0", mc);
        mc_mid = mc.deepcopy();
        setTimeout(function() {mat_gen(mat_obj["mat_mid"], mc_mid);}, 800);
        
        //anime 3
        setTimeout(function() {mat_gen(mat_obj["mat_end"], mat_color_add());}, 1600);
        
        if (mat_obj["bonus_level"]!=undefined) {
            setTimeout(function() {cal_score(mat_obj["bonus_level"], mat_obj["count_explode"]);}, 800);
        }
        
        // set enableClick flag
        if(!queue.length) {
            setTimeout(function() {states["enableClick"] = true;}, 3200);
            return;
        }
        
    } else {
        states["queue_timeout"]--;
        console.debug(states["queue_timeout"]);
    }
}

function animebutton() {
    console.debug(queue);
    if(queue.length || (!queue.length && states["i"] != 0)) {
        states["i"] = anime(states["i"]);
    } else {
        $("#b1").attr("style","display:none");
        states["enableClick"] = true;
    }
}

function anime(i) {
    if (i==0) {
        states["enableClick"] = false;
        mat_obj = queue.pop();
        //console.debug(obj_pop);

        //anime 1
        if (mat_obj["type"]==0) { //normal
            var mc = mat_color_add(mat_obj["mat_explode"], "#A0A0A0");
            mat_gen(mat_obj["mat_old"], mc);
            return 1;
        } else if (mat_obj["type"]==1) { //level up
            $("#step").text(mat_obj["step_level"]);
            $("#level").text(mat_obj["level"]);
            mat_gen(mat_obj["mat_end"], mat_color_add());
            return 0;
        } else if (mat_obj["type"]==2) { //end
            game_over();
            return 0;
        }
        return 0;
    } else if (i==1) {
        //anime 2
        mc = mat_color_add(mat_obj["mat_affacted"], "#E0E0E0");
        mc = mat_color_add(mat_obj["mat_explode"], "#A0A0A0", mc);
        mc_mid = mc.deepcopy();
        mat_gen(mat_obj["mat_mid"], mc_mid);
        return 2;
        
    } else if (i==2) {
        //anime 3
        mat_gen(mat_obj["mat_end"], mat_color_add());
        
        if (mat_obj["bonus_level"]!=undefined) {
            setTimeout(function() {cal_score(mat_obj["bonus_level"], mat_obj["count_explode"]);}, 800);
        }
        // set enableClick flag
        // states["enableClick"] = true;
        return 0;
    }
}


function game_init() {
    matsize = 7;
    unused = -2;
    stone = ["②","①"];
    level = 0;
    step_level = 10;
    score = 0;
    next = Math.floor(Math.random()*(matsize));
    if (next==0) next = -1;
    
    $("#score").text(score);
    $("#step").text(step_level);
    $("#level").text(level);
    $("#next").text(next);
    
    count_explode = 1;
    
    mat = new Array(matsize);
    for (var i = 0; i < matsize; i++) {
        mat[i] = new Array(matsize);
        for (var j = 0; j < matsize; j++) {
            mat[i][j] = unused;
        }
    }
    mat_init();
    
    // for display
    queue = [];
    // setInterval(popQueue, 100);
    
    // states
    states = {enableClick: true,
              //queue_wait: false,
              queue_timeout: 0,
              i: 0,
              };
    
    // $("#stdout").text("")
    // $("#stdout").append("stdout<br>")
    
    enableDrop = new Array(matsize);
    var str_out = "";
    for (var j = 0; j < matsize; j++) {
        enableDrop[j] = true;
        str_out += "<td onclick=\"ctrl_add("+j+");\">&nbsp;</td>";
    }
    $("#ctrl").text("");
    $("#ctrl").append("<table border=\"1\"><tr>"+str_out+"</tr></table>");
    
    // for (var j = 0; j < matsize; j++) {
        // $("#c"+j).click();
    // }
    //$("#c0").click(function() {ctrl_add(0);});
    

    $("#b1").click(animebutton);
}

function mat_color_add(mat_mark, color, mat_color_old) {
    if (mat_color_old==undefined) {
        var mat_color = new Array(matsize);
        for (var i = 0; i < matsize; i++) {
            mat_color[i] = new Array(matsize);
            for (var j = 0; j < matsize; j++) {
                mat_color[i][j] = "";
            }
        }
    } else {
        var mat_color = mat_color_old.deepcopy();
    }
    
    if (mat_mark!=undefined) {
        for (var i = matsize-1; i >= 0; i--) {    
            for (var j = 0; j < matsize; j++) {
                if (mat_mark[i][j]) {
                    mat_color[i][j] = color;
                }
            }
        }
    }
    return mat_color;
}
    

function mat_gen(mat, mat_color) {
    var str_out = new String("=================");
    for (var i = matsize-1; i >= 0; i--) {
        str_out += "<tr>";
        for (var j = 0; j < matsize; j++) {
            var td, content;
            if (mat_color[i][j] != "") {
                td = "<td bgcolor=\""+mat_color[i][j]+"\">";
            } else {
                td = "<td>";
            }
            if (mat[i][j]>0) {
                content = mat[i][j];
            } else if (mat[i][j]>unused) {
                content = stone[mat[i][j]-unused-1];
            } else {
                content = "&nbsp;";
            }
            str_out += td + content + "</td>";
        }
        str_out += "</tr>";
    }
    $("#mat").text("");
    $("#mat").append("<table border=\"1\">"+str_out+"</table>");
}


function mat_print(mat) {
    var str_out = new String("=================");
    for (var i = matsize-1; i >= 0; i--) {
        str_out += "<tr>";
        for (var j = 0; j < matsize; j++) {
            str_out += "<td>" + mat[i][j] + "</td>";
        }
        str_out += "</tr>";
    }
    $("#stdout").append("<table>"+str_out+"</table>");
}

function mat_print2(mat, xmax, ymax) {
    var str_out = new String("=================");
    if (ymax <= 1) {
        str_out += "<tr>";
        for (var i = 0; i < xmax; i++) {
            str_out += "<td>" + mat[i] + "</td>";
        }
        str_out += "</tr>";
    } else {
        for (var i = 0; i < xmax; i++) {
            str_out += "<tr>";
            for (var j = 0; j < ymax; j++) {
                str_out += "<td>" + mat[i][j] + "</td>";
            }
            str_out += "</tr>";
        }
    }
    $("#stdout").append("<table>"+str_out+"</table>");
}

function set_vertical() {
    var vertical = new Array(matsize);
    for (var j = 0; j < matsize; j++) {
        var i = 0
        while (i < matsize && mat[i][j] > unused) {
            i++;
        }
        vertical[j] = i;
    }
    return vertical;
}

function set_horizontal() {
    var horizontal = new Array(matsize);
    for (var i = 0; i < matsize; i++) {
        horizontal[i] = new Array(matsize);
        var jmin = 0;
        var last = true;
        for (var j = 0; j < matsize; j++) {
            horizontal[i][j] = 0;
            if (last && mat[i][j] <= unused) {
                last = false;
                for (var jj = jmin; jj < j; jj++) {
                    horizontal[i][jj] = j-jmin;
                }
            }
            if (!last && mat[i][j] > unused) {
                last = true;
                jmin = j;
            }
        }
        if (last) {
            for (var jj = jmin; jj < matsize; jj++) {
                horizontal[i][jj] = matsize-jmin;
            }
        }
    }
    return horizontal;
}

function one_step(bonus_level, debug){
    var mat_old = mat.deepcopy(); //mat_old
    mat_explode = new Array(matsize);
    mat_affacted = new Array(matsize);
    for (var i = 0; i < matsize; i++) {
        mat_explode[i] = new Array(matsize);
        mat_affacted[i] = new Array(matsize);
        for (var j = 0; j < matsize; j++) {
            mat_explode[i][j] = false;
            mat_affacted[i][j] = false;
        }
    }
    count_explode = 0;
    horizontal = set_horizontal();
    vertical = set_vertical();
    
    for (var i = 0; i < matsize; i++) {
        for (var j = 0; j < matsize; j++) {
            if (mat[i][j] == horizontal[i][j] || mat[i][j] == vertical[j]) {
                mat_explode[i][j] = true;
                count_explode++;
                
                if (0 <= i+1 && i+1 < matsize) {
                    mat_affacted[i+1][j] = true;
                }
                if (0 <= i-1 && i-1 < matsize) {
                    mat_affacted[i-1][j] = true;
                }
                if (0 <= j+1 && j+1 < matsize) {
                    mat_affacted[i][j+1] = true;
                }
                if (0 <= j-1 && j-1 < matsize) {
                    mat_affacted[i][j-1] = true;
                }
            }
        }
    }
    
    if (count_explode == 0) {
        return count_explode; // do nothing
    } else {
        // explode
        for (var i = 0; i < matsize; i++) {
            for (var j = 0; j < matsize; j++) {
                if (mat_explode[i][j]) { // explode
                    mat[i][j] = unused;
                } else if (mat_affacted[i][j]) { // affacted
                    if (unused < mat[i][j] && mat[i][j] < 0) { //a.k.a. mat[i][j] == -1
                        mat[i][j] += 1;
                    } else if (mat[i][j] == 0) {
                        mat[i][j] = Math.floor(Math.random()*(matsize-1))+1; // rand 0 and 1-7
                        // if (mat[i][j] == 0) {
                            // mat[i][j] = unused + 1;
                        // }
                    }
                }
            }
        }
        
        var mat_mid = mat.deepcopy();  // mat_mid
        
        // digits drop
        for (var j = 0; j < matsize; j++) {
            var ix = 0;
            for (var i = 0; i < matsize; i++){
                if (mat[i][j] > unused) {
                    mat[ix][j] = mat[i][j];
                    ix++;
                }
            }
            for (var i = ix; i < matsize; i++){
                mat[i][j] = unused;
            }
        }
        
        // c
        queue.unshift({type: 0,
                       mat_old: mat_old,
                       mat_mid: mat_mid,
                       mat_end: mat.deepcopy(),
                       mat_explode: mat_explode.deepcopy(),
                       mat_affacted: mat_affacted.deepcopy(),
                       bonus_level: bonus_level,
                       count_explode: count_explode,
                       //score_increment: cal_score(bonus_level, count_explode)
                      });
                       
        if (debug) { //for debug
            console.debug(queue);
        }
        
        $("#b1").removeAttr("style"); ////////// one frame
        states["enableClick"] = false;
        
        return count_explode; // have done something
    }
}

function cal_score(bonus_level, count_explode) {
    //alert(count_explode);
    score += Math.pow(2, bonus_level) * count_explode;
    $("#score").text(score);
}

function all_step_js(debug) {
    var bonus_level = 0;
    while (one_step(bonus_level,debug)) {
        //cal_score(bonus_level, count_explode);
        bonus_level++;
    }
}

function add_one(line_n, digit) {
    for (var i = 0; i < matsize; i++) {
        if (mat[i][line_n] <= unused) {
            mat[i][line_n] = digit;
            return true;
        }
    }
    return false;
}

function ctrl_add(line_n) {
    if (states["enableClick"] && enableDrop[line_n]) {
        add_one(line_n, next);
        mat_gen(mat, mat_color_add());
        
        all_step_js();
        
        step_level--;
        
        $("#step").text(step_level); /////change step level
        
        if (step_level==0) {
            level_up();
        }
        
        next = Math.floor(Math.random()*(matsize));
        if (next==0){
            next = -1;
            $("#next").text(stone[0]);
        } else {
            $("#next").text(next);
        }
        
        v = set_vertical();
        for (var j = 0; j < matsize; j++) {
            enableDrop[j] = v[j] < matsize;
        }
    }
}

function level_up() {
    level++;
    step_level = 10;
    var game_over_flag = false;
    for (var j = 0; j < matsize; j++) {
        if (!enableDrop[j]) {
            game_over_flag = true;
        }
    }
    
    for (var i = matsize-1; i >= 1; i--) {
        mat[i] = mat[i-1].deepcopy();
    }
    mat[0] = new Array(matsize);
    for (var j = 0; j < matsize; j++) {
        mat[0][j] = unused+1;
    }
    queue.unshift({type:1, mat_end:mat.deepcopy(), step_level:step_level, level:level});
    if (game_over_flag) queue.unshift({type:2});
}

function game_over() {
    queue = [];
    states["enableClick"] = false;
    $("#mat").text("final score:"+score);
    $("#ctrl").text("");
    return;
}

function debug() {
    // $(this).text(matsize);
    // matsize += mat[3][1];
    //game_init();
    add_one(0,1);
    add_one(3,-1);
    add_one(3,2);
    add_one(3,3);
    add_one(3,8);
    add_one(2,0);
    add_one(2,2);
    add_one(1,3);
    add_one(5,6);
    add_one(6,6);
    add_one(4,6);
    //mat_print(mat);
    //mat_print(set_horizontal());
    //mat_print2(set_vertical(),7,1);
    //all_step_js(true);
    //one_step();
    mat_gen(mat, mat_color_add());

}

function mat_init() {
    add_one(0,1);
    add_one(0,-1);
    add_one(2,2);
    add_one(2,3);
    add_one(3,5);
    add_one(2,0);
    add_one(2,2);
    add_one(1,3);
    add_one(5,6);
    add_one(6,6);
    add_one(4,6);
    all_step_js();
    score = 0;
    queue = [];
    mat_gen(mat, mat_color_add());
}

game_init();
$("#s").click(game_init);
//$("#s1").click(function() {if (states["enableClick"]) one_step(undefined,false);} );
//$("#sa").click(function() {if (states["enableClick"]) all_step_js();} );
