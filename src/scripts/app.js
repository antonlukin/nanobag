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

  const form = document.querySelector('.feedback > form')

  const showMessage = (message) => {
    const feedback = document.querySelector('.feedback')

    const figure = document.createElement('figure')
    figure.innerHTML = `<p>${message}</p>`
    feedback.appendChild(figure)

    const close = document.createElement('button')
    close.textContent = 'Закрыть'
    close.setAttribute('type', 'button')
    figure.appendChild(close)

    close.addEventListener('click', (e) => {
      e.preventDefault()
      feedback.removeChild(figure)
    })
  }

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      const fields = {
        email: form.querySelector('input').value
      }

      form.querySelector('input').value = ''

      const response = await fetch('/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields)
      })

      const data = await response.json()

      if (response.status === 200) {
        return showMessage('Спасибо! <br>Скоро мы свяжемся с вами')
      }

      if (data.message) {
        throw new Error(data.message)
      }

    } catch(error) {
      console.error(error);
    }

    showMessage('Ошибка! <br>Не удалось оставить заявку')
  }

  form.addEventListener('submit', submitForm)
})()
