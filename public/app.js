function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie);
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
      if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}

const postData = async (url, data) => {
    return await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': data._csrf,
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.json());
};

const trigger = (el, event) => el.dispatchEvent(new Event(event));

const createCalendarForm = (block) => {
    const form = block.querySelector('form');
    const submitBtn = block.querySelector('.btn-success');
    const alert =  block.querySelector('.alert');
    submitBtn.addEventListener('click', () => {
        const formData = Object.fromEntries(new FormData(form).entries());
        submitBtn.disabled = true;

        postData('/calendar/create', formData)
            .then((resp) => {
                if (resp && resp.error) {
                    alert.textContent = resp.error; 
                    alert.classList.remove('d-none');
                } else {
                    window.location.reload();
                }
            }).finally(() => {
                submitBtn.disabled = false;
            });
    });
};


const postLinkBtn = (btn, data) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const { target } = e; 
        target.disabled = true;

        postData(target.href, data)
        .finally(() => {
            window.location.reload();
        });
    });
};

const parseJSON = (str) => {
    let json;
    try {
        json = JSON.parse(str);
    } catch {
        json = null;
    }
    return json;
}

document.addEventListener('DOMContentLoaded', () => {
    const components = {
        createCalendarForm,
        postLinkBtn,
    };


    [...document.querySelectorAll('[data-cr]')].forEach((component) => {
        const dataCr = component.getAttribute('data-cr');
        components[dataCr](component, parseJSON(component.getAttribute('data-cr-config')));
    });
});




