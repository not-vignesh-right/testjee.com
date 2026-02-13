// Mobile nav toggle
const navBtn=document.getElementById('nav-toggle');
const navMenu=document.getElementById('nav-menu');
if(navBtn&&navMenu){
  navBtn.addEventListener('click',()=>{
    navMenu.classList.toggle('hidden');
  });
}

// Reveal on scroll
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');observer.unobserve(e.target);}})
},{threshold:0.12});

document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Smooth anchor close menu on mobile
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',()=>{
    if(navMenu&&!navMenu.classList.contains('hidden')) navMenu.classList.add('hidden');
  });
});
