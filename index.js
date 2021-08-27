window.onscroll = function () {
    // Hide and display the go to top button
    var top = document.getElementById("goup");
    if (pageYOffset >= 100) {
        top.style.display = "unset";
    } else {
        top.style.display = "none";
    }
    // Hide and show Go down button
        var down = document.getElementById("down");
        if (pageYOffset >= 500) {
            down.style.display = "none";
        } else {
            down.style.display = "flex";
        }
};
// Collapsable nav bar
var nav = document.getElementById("dropdown");
var header = document.getElementById("tocollapse");
// nav.addEventListener('click', function () {
    // if (header.style.display === "block") { //if nav is visible then hide
    //     header.style.height = "0";
    //     header.style.display = "none";
    //     document.getElementById("dropdown-img").src = "imgs/dropdown.png"
    // } else { //if nav is not visible , then display
    //     header.style.height = "100vh";
    //     header.style.display = "block";
    //     document.getElementById("dropdown-img").src = "imgs/close.png"
    // }
// });
function openclosenav(){
    if (header.style.display === "block") { //if nav is visible then hide
        header.style.height = "0";
        header.style.display = "none";
        document.getElementById("dropdown-img").src = "imgs/dropdown.png"
    } else { //if nav is not visible , then display
        header.style.height = "100vh";
        header.style.display = "block";
        document.getElementById("dropdown-img").src = "imgs/close.png"
    }
}
// Nav closes when clicked on item - only for mobile version
var navitems = document.getElementsByClassName("nav-items");
function screen_resize() {
    if (window.innerWidth >= 990) {
        header.style.display = "inline";
    } else if (window.innerWidth < 990) {
        header.style.display = "none";
        document.getElementById("dropdown-img").src = "imgs/dropdown.png"
        // nav closes after clicking on a location
        for(let i=0;i<3;i++){
            navitems[i].addEventListener('click', function () {
                if (header.style.display == "block") { //if nav is visible then hide
                    header.style.height = "0";
                    header.style.display = "none";
                    document.getElementById("dropdown-img").src = "imgs/dropdown.png"
                }
            });
        }
    }
}
// if window resize call responsive function
$(window).resize(function () {
    screen_resize();
});
// call responsive function on default :)
$(document).ready(function () {
    screen_resize();
});