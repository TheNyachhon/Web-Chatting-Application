const forgotpass = document.querySelector('#forgot-pass')
const popup = document.querySelector('#forgot-pass-popup')
const btn = document.querySelector('#thanks-btn')
forgotpass.addEventListener('click',()=>{
    popup.style.display="flex"
})
btn.addEventListener('click',()=>{
    popup.style.display="none"
})