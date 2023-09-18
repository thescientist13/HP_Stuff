import {html} from 'lit';

export const GenderFemale = ({ color, size,  ...restParam }: {color: string, size: string|number}) => {
  const others = restParam.toString();
  
    return html`
        <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                width=${size}
                height=${size}
                fill=${color}
                ${others}
        >
            <path d="M8 0a5.38 5.38 0 00-5.373 5.373 5.383 5.383 0 004.885 5.352V12.9H5.373v.948h2.139V16h.976v-2.152h2.139V12.9H8.488v-2.175a5.383 5.383 0 004.885-5.352A5.38 5.38 0 008 0zm0 1a4.365 4.365 0 014.373 4.373A4.367 4.367 0 018 9.748a4.367 4.367 0 01-4.373-4.375A4.365 4.365 0 018 1z"></path>
        </svg>
    `;
};

