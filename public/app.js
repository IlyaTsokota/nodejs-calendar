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

const datePickerForm = (block, data) => {
    const picker = block.querySelector('.date-picker');
    const eventsBlock = block.querySelector('.events');
    const addBtn = block.querySelector('.btn-add');
    const modal = block.querySelector('.modal');
    const form = modal.querySelector('form');
    const submitBtn = modal.querySelector('.btn-success');
    const alert =  modal.querySelector('.alert');
    const closeModalBtn =  modal.querySelector('.btn-close');

    const datepicker = new Datepicker(picker); 
    datepicker.setDate(Date.now());

    const getDayEvents = () => {
        postData('/calendar/events', { 
            date: datepicker.getDate(),
            ...data,
        }).then((resp) => {
            
            if (resp) {
                let content = `<ul class="list-group w-100">`;

                resp.forEach(({ title, category, id} ) => {
                    content += `
                    <li class="list-group-item w-100" style="background-color: ${data.color};">
                        <a style="color: ${data.color};filter: invert(100%);" href="/event/${id}" class="d-block  w-100 text-dark text-decoration-none">
                            ${title} - ${category.toUpperCase()}
                        </a>
                    </li>`
                })
                content += '</ul>'

                eventsBlock.innerHTML = content;
            } else {
                eventsBlock.innerHTML = "<h3>There are no events on this day</h3>";
            }
        });        
    };

    const addEvent = () => {
        submitBtn.addEventListener('click', () => {
            const formData = Object.fromEntries(new FormData(form).entries());
            submitBtn.disabled = true;
            const dataEvent = {
                ...formData,
                date: datepicker.getDate(),
                calendarId: data.id,
            };

            postData('/event/add', dataEvent)
                .then((resp) => {
                    if (resp && resp.error) {
                        alert.textContent = resp.error; 
                        alert.classList.remove('d-none');
                    } else {
                        trigger(closeModalBtn, 'click');
                        getDayEvents();
                    }
                }).finally(() => {
                    submitBtn.disabled = false;
                });
        });
    };

    addBtn.addEventListener('click', () => {
        alert.classList.add('d-none');
    });

    picker.addEventListener('changeDate', (e) => {
        getDayEvents();
    });

    getDayEvents();
    addEvent();
};

document.addEventListener('DOMContentLoaded', () => {
    const components = {
        createCalendarForm,
        postLinkBtn,
        datePickerForm,
    };


    [...document.querySelectorAll('[data-cr]')].forEach((component) => {
        const dataCr = component.getAttribute('data-cr');
        components[dataCr](component, parseJSON(component.getAttribute('data-cr-config')));
    });
});




