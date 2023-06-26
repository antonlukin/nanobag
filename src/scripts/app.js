(function() {
  const header = document.querySelector('.header')

  // Header clone
  const clone = header.cloneNode(true)
  document.body.appendChild(clone)

  const scrollHandler = () => {
    const height = header.getBoundingClientRect().height

    if (window.scrollY - height > 0) {
      return clone.classList.add('header--fixed')
    }

    clone.classList.remove('header--fixed')
  }

  window.addEventListener('scroll', scrollHandler)
  window.addEventListener('load', scrollHandler)
})()