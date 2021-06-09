const domRefs = {};

function getRef(elementId) {
  if (!domRefs.hasOwnProperty(elementId)) {
    domRefs[elementId] = {
      count: 1,
      ref: null,
    };
    return document.getElementById(elementId);
  } else {
    if (domRefs[elementId].count < 3) {
      domRefs[elementId].count = domRefs[elementId].count + 1;
      return document.getElementById(elementId);
    } else {
      if (!domRefs[elementId].ref)
        domRefs[elementId].ref = document.getElementById(elementId);
      return domRefs[elementId].ref;
    }
  }
}

function create(tagName, obj) {
  const {className, text} = obj
  const elem = document.createElement(tagName)
  elem.className = className
  elem.textContent = text
  return elem
}

//Checks for internet connection status
if (!navigator.onLine)
  notify(
    "There seems to be a problem connecting to the internet, Please check you internet connection.",
    "error",
    "",
    true
  );
window.addEventListener("offline", () => {
  notify(
    "There seems to be a problem connecting to the internet, Please check you internet connection.",
    "error",
    true,
    true
  );
});
window.addEventListener("online", () => {
  getRef("notification_drawer").clearAll();
  notify("We are back online.", "success");
});

const themeSwitcher = getRef("theme_switcher");

if (themeSwitcher) {
  if (localStorage.theme === "dark") {
    nightlight();
    themeSwitcher.checked = true;
  } else if (localStorage.theme === "light"){
    daylight();
    themeSwitcher.checked = false;
  }
  else {
    if (window.matchMedia(`(prefers-color-scheme: dark)`).matches) {
      nightlight();
      themeSwitcher.checked = true;
    } else {
      daylight();
      themeSwitcher.checked = false;
    }
  }

  function daylight() {
    document.body.setAttribute("data-theme", "light");
  }

  function nightlight() {
    document.body.setAttribute("data-theme", "dark");
  }
  themeSwitcher.addEventListener("change", function (e) {
    if (this.checked) {
      nightlight();
      localStorage.setItem("theme", "dark");
    } else {
      daylight();
      localStorage.setItem("theme", "light");
    }
  });
}

function setAttributes(el, attrs) {
  for (key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function randomHsl(saturation = 80, lightness = 80) {
  let hue = Math.random() * 360;
  let color = {
    primary: `hsla( ${hue}, ${saturation}%, ${lightness}%, 1)`,
    light: `hsla( ${hue}, ${saturation}%, 90%, 0.6)`,
  };
  return color;
}

const selectedColors = [
  "#FF1744",
  "#F50057",
  "#8E24AA",
  "#5E35B1",
  "#3F51B5",
  "#3D5AFE",
  "#00B0FF",
  "#00BCD4",
  "#16c79a",
  "#66BB6A",
  "#8BC34A",
  "#11698e",
  "#FF6F00",
  "#FF9100",
  "#FF3D00",
];
function randomColor() {
  return selectedColors[Math.floor(Math.random() * selectedColors.length)];
}

//Function for displaying toast notifications. pass in error for mode param if you want to show an error.
function notify(message, mode, pinned, sound) {
  if (mode === "error") console.error(message);
  else console.log(message);
  getRef("notification_drawer").push(message, mode, pinned);
  if (navigator.onLine && sound) {
    getRef("notification_sound").currentTime = 0;
    getRef("notification_sound").play();
  }
}

const currentYear = new Date().getFullYear();
function getFormatedTime(time, relative) {
  try {
    if (String(time).indexOf("_")) time = String(time).split("_")[0];
    const intTime = parseInt(time);
    if (String(intTime).length < 13) time *= 1000;
    let timeFrag = new Date(intTime).toString().split(" "),
      day = timeFrag[0],
      month = timeFrag[1],
      date = timeFrag[2],
      year = timeFrag[3],
      minutes = new Date(intTime).getMinutes(),
      hours = new Date(intTime).getHours(),
      currentTime = new Date().toString().split(" ");

    minutes = minutes < 10 ? `0${minutes}` : minutes;
    let finalHours = ``;
    if (hours > 12) finalHours = `${hours - 12}:${minutes}`;
    else if (hours === 0) finalHours = `12:${minutes}`;
    else finalHours = `${hours}:${minutes}`;

    finalHours = hours >= 12 ? `${finalHours} PM` : `${finalHours} AM`;
    if (relative) {
      return `${date} ${month} ${year}`;
    } else return `${finalHours} ${month} ${date} ${year}`;
  } catch (e) {
    console.error(e);
    return time;
  }
}

window.addEventListener("load", () => {
  document.addEventListener("keyup", (e) => {
    if (e.code === "Escape") {
      if (isSiteMapOpen) {
        hideSiteMap();
      }
      else if (isRoomOpen) {
        hideRoom()
      }
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, sm-button:not([disable]), .interact")) {
      createRipple(e, e.target.closest("button, sm-button, .interact"));
    }
  });
  if (window.location.hash !== '')
    showRoom(window.location.hash, false)
});
function createRipple(event, target) {
  const circle = document.createElement("span");
  const diameter = Math.max(target.clientWidth, target.clientHeight);
  const radius = diameter / 2;
  const targetDimensions = target.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - (targetDimensions.left + radius)}px`;
  circle.style.top = `${event.clientY - (targetDimensions.top + radius)}px`;
  circle.classList.add("ripple");
  const rippleAnimation = circle.animate(
    [
      {
        transform: "scale(3)",
        opacity: 0,
      },
    ],
    {
      duration: 1000,
      fill: "forwards",
      easing: "ease-out",
    }
  );
  target.append(circle);
  rippleAnimation.onfinish = () => {
    circle.remove();
  };
}

function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    let context = this,
      args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

let timerId;
function throttle(func, delay) {
  // If setTimeout is already scheduled, no need to do anything
  if (timerId) {
    return;
  }

  // Schedule a setTimeout after delay seconds
  timerId = setTimeout(function () {
    func();

    // Once setTimeout function execution is finished, timerId = undefined so that in
    // the next scroll event function execution can be scheduled by the setTimeout
    timerId = undefined;
  }, delay);
}

const siteMap = [
  {
    floor: "Current Products",
    brief: ``,
    outlets: [
      {
        name: "Bitcoin Bonds",
        url: "bitcoinbonds",
        brief: `Bondholders get a minimum guarantee of 13% interest per annum during the lock-in period or 50% of all Bitcoin price gains whichever is higher. It offers full capital protection if
        Bitcoin prices fall below acquisition price.`,
        isSold: true,
        buyUrl: `purchase_room`,
        status: `We are servicing current customers only. A new Blockchain-based version of Bitcoin Bonds will be available soon.`
      },
      {
        name: `Bob's Fund`,
        url: `bob'sfund`,
        brief: `Bobs Fund is a 20 year long term Bitcoin price linked product. Investors are entitled to 100% of Bitcoin price gains, but they most hold for 20 years.`,
        isSold: true,
        buyUrl: `purchase_room`
      },
/*       {
        name: "Initial Coin Offering",
        url: "ico",
        brief: `The Initial Coin Offering (ICO) of RanchiMall was launched in 2017. It was envisioned to sell 21 million tokens over 14 phases over 3 years.`,
        isSold: true,
        buyUrl: `purchase_room`
      }, */
    ],
  },
  /*   {
      floor: "Blockchain Contracts",
      brief: `Blockchain Contracts are one of RanchiMall's flagship innovations.
        We believe each blockchain contract will be transformational in its area and will add
        tremendously to our enterprise value.`,
      outlets: [
        {
          name: "Incorporation Blockchain Contract",
          url: "incorporationblockchaincontract",
          brief: `RanchiMall is incorporated on the blockchain and structured as Incorporation Blockchain Contract. Incorporation Blockchain Contract owns all the other blockchain contracts of RanchiMall.`
        },
        {
          name: `Internship Blockchain Contract`,
          url: `internshipblockchaincontract`,
          brief: `Internship Blockchain Contract tokenizes all our internship initiatives. This is owned by Incorporation Blockchain Contract.`
        },
        {
          name: "FLO Blockchain Contract",
          url: "floblockchaincontract",
          brief: `FLO Blockchain contract consists of all projects RanchiMall performs on FLO Blockchain (previously called Florincoin).`
        }
      ],
    },
    {
      floor: 'Blockchain Apps',
      brief: ``,
      outlets: [
        {
          name: "Web Wallet",
          brief: `Purely web-based blockchain wallet.`,
          url: 'webwallet'
        },
        {
          name: `FLO Messenger`,
          url: `flomessenger`,
        },
        {
          name: "Content Collaboration",
          brief: `A way for anonymous users across the Internet to collaborate and create beautiful articles.`,
          url: "contentcollaboration",
        },
        {
          name: "Ranchimall Times",
          brief: `Article publication platform of RanchiMall`,
          url: "ranchimalltimes",
        },
      ],
    },
    {
      floor: 'Experimental Ideas',
      brief: ``,
      outlets: [
        {
          name: "Blockchain Cloud",
          url: "blockchaincloud",
        },
        {
          name: `UPI On Blockchain`,
          url: `upionblockchain`,
        },
        {
          name: "E-Commerce On Blockchain",
          url: "e-commerceonblockchain"
        }
      ],
    },
    {
      floor: 'Statistics and Administration',
      brief: ``,
      outlets: [
        {
          name: "Incorporation",
          url: "incorporation",
        },
        {
          name: `Team`,
          url: `team`,
        },
        {
          name: "Operational Statistic",
          url: "operationalstatistic",
        }
      ],
    }, */
];
// templates

const bitBondRowTemplate = document.createElement('template')
bitBondRowTemplate.innerHTML = `
<div class="bit-bond-series__row grid">
    <div class="grid">
        <h5 class="label color-0-8 weight-500">Series</h5>
        <h3 class="value original-value"></h3>
    </div>
    <div class="flex align-center space-between">
        <div class="grid">
            <h5 class="label color-0-8 weight-500">Invested</h5>
            <h3 class="value">$100</h3>
        </div>
        <div class="grid justify-right text-align-right">
            <h5 class="label color-0-8 weight-500">Current value</h5>
            <h3 class="value current-value" style="color: var(--green)"></h3>
            <div class="flex align-center">
                <svg class="icon up-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z"/></svg>
                <span class="percent-gain"></span>
                <span class="time-elapsed"></span>
            </div>
        </div>
    </div>

</div>
`

const bobsFundRowTemplate = document.createElement('template')
bobsFundRowTemplate.innerHTML = `
<div class="bob-fund__row grid">
    <div class="grid">
        <h5 class="label color-0-8 weight-500">FLO ID</h5>
        <h3 class="person__name breakable"></h3>
    </div>
    <div class="flex">
        <div class="grid">
            <h5 class="label color-0-8 weight-500">Invested</h5>
            <h3 class="value original-value"></h3>
        </div>
        <div class="grid justify-right text-align-right">
            <h4 class="label color-0-8 weight-500">Current value</h4>
            <h3 class="value current-value" style="color: var(--green)"></h3>
            <div class="flex align-center">
              <svg class="icon up-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z"/></svg>
              <span class="percent-gain"></span>
              <span class="time-elapsed"></span>
            </div>
        </div>
    </div>
</div>
`


const floorListitemTemplate = document.createElement('template')
floorListitemTemplate.innerHTML = `
<li class="floor_list__item">
  <button class="floor_list__header floor__button">
      <h2 class="h2 floor-num">Floor</h2>
      <h3 class="h3 accent-color"></h3>
  </button>
  <ul class="outlet-list grid"></ul>
</li>
`

const outletListitemTemplate = document.createElement('template')
outletListitemTemplate.innerHTML = `
  <li class="outlet-list__item interact">
    <a class="grid align-center flow-column gap-1 justify-start">
      <div>
        <h4 class="outlet-title"></h4>
        <p class="outlet-brief"></p>
      </div>
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"/></svg>
    </a>
  </li>
`




const render = {
  bitBondRow(obj) {
    const { series, currentValue, timeElapsed, percentGain } = obj;
    const row = bitBondRowTemplate.content.cloneNode(true);
    row.querySelector(".original-value").textContent = series.toLocaleString(`en-US`, { style: 'currency', currency: 'USD' });
    row.querySelector(".current-value").textContent = currentValue.toLocaleString(`en-US`, { style: 'currency', currency: 'USD' });
    row.querySelector(".time-elapsed").textContent = `In last ${timeElapsed} years`;
    row.querySelector(".percent-gain").textContent = `${percentGain}%`;
    return row;
  },
  bobFundRow(obj) {
    const { investorName, invested, floId, currentValue, timeElapsed, gain } = obj;
    const row = bobsFundRowTemplate.content.cloneNode(true);
    row.querySelector(".person__name").textContent = floId;
    row.querySelector(".original-value").textContent = `${invested.toLocaleString(`en-IN`, { style: 'currency', currency: 'INR' })}`;
    row.querySelector(".current-value").textContent = `${currentValue.toLocaleString(`en-IN`, { style: 'currency', currency: 'INR' })}`;
    row.querySelector(".percent-gain").textContent = `${gain}%`;
    row.querySelector(".time-elapsed").textContent = `In last ${timeElapsed} years`;
    return row;
  },
  icoInvestorRow(obj, options) {
    const { extension, investorName, bio, contribution } = obj;
    const { thumbnail } = options;
    const row = getRef("ico_investor_row").content.cloneNode(true);
    const card = row.querySelector(".person-card");
    const folder = thumbnail ? "investors-thumbnail" : "investors";
    const investorImage = row.querySelector(".person__image");
    if (thumbnail) card.classList.add("person-card--small");
    else card.classList.add("person-card--big");
    investorImage.src = `assets/${folder}/${investorName}.${extension}`;
    investorImage.setAttribute("alt", `${investorName} profile picture`);
    row.querySelector(".person__name").textContent = investorName;
    row.querySelector(".investor__bio").textContent = bio;
    row.querySelector(".investor__contribution").textContent = contribution;
    return row;
  },
  internCard(obj) {
    const { extension, internName, level, floId, project } = obj;
    const card = getRef("intern_card_template").content.cloneNode(true).firstElementChild;
    const investorImage = card.querySelector(".person__image");
    investorImage.src = `assets/interns/${internName}.${extension}`;
    investorImage.setAttribute("alt", `${internName} profile picture`);
    card.querySelector(".intern__level").classList.add(level.toLowerCase())
    card.querySelector(".intern__level").textContent = level;
    card.querySelector(".person__name").textContent = internName;
    card.querySelector(".intern-flo-id").textContent = floId;
    card.querySelector(".intern__project").textContent = project;
    return card;
  },
  icoPhase(obj) {
    const { phase, date, info } = obj;
    const template = getRef("ico_phase_template").content.cloneNode(true);
    template.querySelector(".phase__title").textContent = `Phase ${phase}`;
    template.querySelector(".phase__date").textContent = date;
    template.querySelector(".phase__description").textContent = info;
    return template;
  },
  floorLabel(floorNumber, offsetTop) {
    const floorLabel = getRef("floor_indicator_template").content.cloneNode(
      true
    ).firstElementChild;
    floorLabel.setAttribute("style", `top: ${offsetTop}px`);
    floorLabel.dataset.target = `floor_${floorNumber}`;
    return floorLabel;
  },
  outletListItem(outletObj) {
    const { name, brief, url } = outletObj
    const li = outletListitemTemplate.content.cloneNode(true).firstElementChild
    li.querySelector('a').href = `${url}.html`
    li.querySelector('.outlet-title').textContent = name
    // li.querySelector('.outlet-brief').textContent = brief ? brief : ''
    return li
  },
  floorListitem(floorObj, index) {
    const { floor, outlets } = floorObj
    const li = floorListitemTemplate.content.cloneNode(true).firstElementChild
    li.firstElementChild.dataset.target = `floor_${index + 1}`;
    li.querySelector('.h3').textContent = floor
    li.querySelector('.floor-num').textContent = `floor ${index + 1}`

    const h3 = document.createElement('h3')
    h3.classList.add('h3', 'weight-900', 'floor-list__outlet')
    h3.textContent = 'Outlets'

    const frag = document.createDocumentFragment()
    outlets.forEach(outlet => frag.append(render.outletListItem(outlet)))

    li.querySelector('.outlet-list').append(h3, frag)
    return li
  },
  outletSwitcherButton(outletObj, activeOutlet) {
    const { name, url } = outletObj
    const button = document.createElement('a')
    button.classList.add('outlet_switcher__button')
    if (activeOutlet === url) {
      button.classList.add('outlet_switcher__button--active')
    }
    button.href = url
    button.textContent = name
    return button;
  },
  statusBanner(bannerMsg) {
    const banner = document.createElement('section')
    banner.classList.add('banner')
    banner.innerHTML = `
      <p class="banner__text">${bannerMsg}</p>
      <button class="close-button" onclick="this.parentNode.remove()">
          <svg class="icon icon-only close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg>
      </button>
    `
    return banner
  }
};

const floors = [
  "Current Products",
  "Blockchain Contracts",
  "Blockchain Applications",
  "Experimental Ideas",
  "Statistics and Administration",
];

/* 
    Animations
*/

const fadeIn = [{ opacity: 0 }, { opacity: 1 }];

const fadeOut = [{ opacity: 1 }, { opacity: 0 }];

// Slide animations
const slideInLeft = [
  {
    transform: "translateX(1rem)",
    opacity: 0,
  },
  {
    transform: "translateX(0)",
    opacity: 1,
  },
];
const slideInRight = [
  {
    transform: "translateX(-1rem)",
    opacity: 0,
  },
  {
    transform: "translateX(0)",
    opacity: 1,
  },
];
const slideOutLeft = [
  {
    transform: "translateX(0)",
    opacity: 1,
  },
  {
    transform: "translateX(-1rem)",
    opacity: 0,
  },
];
const slideOutRight = [
  {
    transform: "translateX(0)",
    opacity: 1,
  },
  {
    transform: "translateX(1rem)",
    opacity: 0,
  },
];
const slideInDown = [
  {
    transform: "translateY(-1rem)",
    opacity: 0,
  },
  {
    transform: "translateY(0)",
    opacity: 1,
  },
];
const slideInUp = [
  {
    transform: "translateY(1rem)",
    opacity: 0,
  },
  {
    transform: "translateY(0)",
    opacity: 1,
  },
];
const slideOutUp = [
  {
    transform: "translateY(0)",
    opacity: 1,
  },
  {
    transform: "translateY(-1rem)",
    opacity: 0,
  },
];
const slideOutDown = [
  {
    transform: "translateY(0)",
    opacity: 1,
  },
  {
    transform: "translateY(1rem)",
    opacity: 0,
  },
];

// eases
const easeInOvershoot = `cubic-bezier(0.6, -0.28, 0.735, 0.045)`;
const easeOutOvershoot = `cubic-bezier(0.175, 0.885, 0.32, 1.275)`;

//////////////////


document.addEventListener('click', e => {
  if (e.target.closest('.floor-label, .floor__button')) {
    const label = e.target.closest('.floor-label, .floor__button')
    const target = label.dataset.target
    window.open(`index.html#${target}`, '_self')
    if (isSiteMapOpen) {
      hideSiteMap()
    }
  }
})

const outletObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelector("sm-carousel").startAutoPlay();
      } else {
        entry.target.querySelector("sm-carousel").stopAutoPlay();
      }
    });
  },
  {
    threshold: 0.6,
  }
);

/* document
  .querySelectorAll(".carousel-container")
  .forEach((outlet) => outletObserver.observe(outlet)); */

let isOutletSwitcherOpen = false;
document.addEventListener("click", (e) => {
  if (isOutletSwitcherOpen) {
    hideOutletSwitcher();
  } else {
    if (e.target.closest(".outlet-label")) {
      clearTimeout(mouseOverTimeout);
      showOutletSwitcher(e.target.closest(".outlet-label"));
    }
  }
});

let mouseOverTimeout;
document.querySelectorAll(".outlet-label").forEach((label) => {
  label.addEventListener("mouseenter", (e) => {
    mouseOverTimeout = setTimeout(() => {
      showOutletSwitcher(e.target);
    }, 300);
  });
});
document.querySelectorAll(".outlet-label").forEach((label) => {
  label.addEventListener("mouseleave", (e) => {
    clearTimeout(mouseOverTimeout);
  });
});

function showOutletSwitcher(button) {
  if (isOutletSwitcherOpen) return;
  isOutletSwitcherOpen = true;
  const buttonDimensions = button.getBoundingClientRect();
  getRef("outlet_switcher").setAttribute(
    "style",
    `top: ${buttonDimensions.top + document.documentElement.scrollTop
    }px; left: ${buttonDimensions.left}px;`
  );
  getRef("outlet_switcher").classList.remove("hide-completely");
  getRef("outlet_switcher").animate(slideInDown, {
    duration: 300,
    easing: easeOutOvershoot,
    fill: "forwards",
  });
  getRef("outlet_switcher").setAttribute('tabindex', '-1')
  getRef("outlet_switcher").focus()
}

function hideOutletSwitcher() {
  if (!isOutletSwitcherOpen) return;
  getRef("outlet_switcher").animate(slideOutUp, {
    duration: 200,
    easing: easeInOvershoot,
    fill: "forwards",
  }).onfinish = () => {
    getRef("outlet_switcher").classList.add("hide-completely");
    isOutletSwitcherOpen = false;
  };
}

let currentPage
function renderSiteMap() {
  const frag = document.createDocumentFragment()
  siteMap.forEach((floor, index) => frag.append(render.floorListitem(floor, index)))
  getRef('floor_list').append(frag)
  const pathArray = location.pathname.split('/')
  for (floor of siteMap) {
    for (outlet of floor.outlets) {
      currentPage = pathArray[pathArray.length - 1]
      if (pathArray[pathArray.length - 1].includes(outlet.url)) {
        renderFloorOutlets(floor, outlet.url)
        break;
      }
    }
  }
}
renderSiteMap()

function renderFloorOutlets(floorObj, activeOutlet) {
  const { floor, outlets } = floorObj
  console.log(floor)
  const frag = document.createDocumentFragment()
  outlets.forEach(outlet => frag.append(render.outletSwitcherButton(outlet, activeOutlet)))
  getRef('outlet_switcher__outlet_container').append(frag)
  getRef('outlet_switcher__floor_num').textContent = floor
  let floorNum = -1
  let outletNum = -1
  for (let i = 0; i < siteMap.length; i++) {
    if (siteMap[i].floor === floor) {
      floorNum = i
      break
    }
  }
  for (let i = 0; i < outlets.length; i++) {
    if (outlets[i].url === activeOutlet) {
      outletNum = i
      break
    }
  }
  // document.querySelector('.outlet-label__name').textContent = floorNum > -1 ? `Floor ${floorNum + 1} outlet ${outletNum + 1}` : ''
  document.querySelector('.outlet-label__no').textContent = outletNum + 1
  document.querySelector('.outlet-label__no').dataset.number = outletNum + 1
  if (outlets[outletNum].hasOwnProperty('status')) {
    getRef('main_header').after(render.statusBanner(outlets[outletNum].status))
  }
}

let isSiteMapOpen = false;

const animeOptions = {
  duration: 600,
  fill: "forwards",
  easing: "ease",
};

const siteMapTimeline = gsap.timeline({
  defaults: { ease: "power3" },
  onReverseComplete: resumeScrolling,
  paused: true,
});
siteMapTimeline
  .from("#elevator_popup", { duration: 0.3, opacity: 0 })
  .from(".floor_list__item", { opacity: 0, y: 16, stagger: 0.1 });



function showSiteMap() {
  document.querySelectorAll(".page").forEach((page) => {
    page.setAttribute("aria-hidden", "true");
  });
  isSiteMapOpen = true;
  pauseScrolling()
  getRef("elevator_popup").classList.remove("hide-completely");
  siteMapTimeline.duration(0.9).play();
}

function hideSiteMap() {
  const scrollY = document.body.style.top;
  window.scrollTo(0, parseInt(scrollY || "0") * -1);
  siteMapTimeline.duration(0.4).reverse();
  document.querySelectorAll(".page").forEach((page) => {
    page.removeAttribute("aria-hidden");
  });
}

function pauseScrolling() {
  document.body.style.overflow = "hidden";
  document.body.style.top = `-${window.scrollY}px`;
}

function resumeScrolling() {
  document.body.style.overflow = "auto";
  document.body.style.top = "initial";
  isSiteMapOpen = false;
  getRef("elevator_popup").classList.add("hide-completely");
}


let tile, tileParent, tileDimensions, tileParentDimensions, currentRoomId
const animeInOptions = {
  duration: 300,
  fill: 'forwards',
  easing: 'ease'
}
const animeOutOption = {
  duration: 300,
  fill: 'forwards',
  easing: 'ease'
}

window.addEventListener('hashchange', e => {
  if (allRooms.length) {
    showRoom(window.location.hash, true)
    renderRoomShorcuts()
  }
})

let isRoomOpen = false

function showRoom(roomId, animate = false) {
  if (roomId === '') return
  pauseScrolling()
  currentRoomId = roomId.split('#').pop()
  tile = document.querySelector(`[href="${roomId}"]`)
  tileParent = tile.parentNode
  tileDimensions = tile.getBoundingClientRect()
  tileParentDimensions = tileParent.getBoundingClientRect()
  getRef('expanding_tile').classList.remove('hide-completely')
  if (animate && !isRoomOpen) {
    getRef('expanding_tile').animate([
      {
        height: `${tileDimensions.height}px`,
        width: `${tileDimensions.width}px`,
        transform: `translate(${tileDimensions.left - tileParentDimensions.left}px, ${tileDimensions.top - tileParentDimensions.top - window.pageYOffset}px)`
      },
      {
        height: `${window.innerHeight}px`,
        width: `${document.querySelector('main').getBoundingClientRect().width}px`,
        transform: `translate(${- tileParentDimensions.left}px, ${- tileParentDimensions.top - window.pageYOffset}px)`
      },
    ],
      animeInOptions)
      .onfinish = () => {
        revealRoom(animate)
      }
  }
  else {
    revealRoom(animate)
  }
  function revealRoom(animate) {
    const roomContainer = document.querySelector('.room-container')
    roomContainer.querySelectorAll('.room').forEach(child => child.classList.add('hide-completely'))
    document.querySelector(roomId).classList.remove('hide-completely')
    getRef('room_title').textContent = tile.querySelector('.room-tile__title').textContent
    getRef('hero_title').textContent = tile.querySelector('.room-tile__title').textContent
    roomContainer.classList.remove('hide-completely')
    if (animate && !isRoomOpen) {
      roomContainer.animate(slideInDown, animeInOptions)
      .onfinish = () => {
        getRef('expanding_tile').classList.add('hide-completely')
        isRoomOpen = true
      }
    }
    else {
      isRoomOpen = true
    }
  }
}

function hideRoom() {
  history.replaceState(null, null, ' ');
  const roomContainer = document.querySelector('.room-container')
  roomContainer.animate(fadeOut, animeOutOption)
    .onfinish = () => {
      roomContainer.classList.add('hide-completely')
    }
  getRef('expanding_tile').classList.remove('hide-completely')
  getRef('expanding_tile').animate([
    {
      height: `${window.innerHeight}px`,
      width: `${document.querySelector('main').getBoundingClientRect().width}px`,
      transform: `translate(${- tileParentDimensions.left}px, ${- tileParentDimensions.top - window.pageYOffset}px)`
    },
    {
      height: `${tileDimensions.height}px`,
      width: `${tileDimensions.width}px`,
      transform: `translate(${tileDimensions.left - tileParentDimensions.left}px, ${tileDimensions.top - tileParentDimensions.top - window.pageYOffset}px)`
    },
  ], animeOutOption)
    .onfinish = () => {
      getRef('expanding_tile').classList.add('hide-completely')
      resumeScrolling()
      isRoomOpen = false
    }
}

const allRooms = document.querySelectorAll('.room-tile')

function renderRoomShorcuts() {
  getRef('room_switcher').innerHTML = ''
  const frag = document.createDocumentFragment()
  allRooms.forEach(room => {
    if (room.href.split('#').pop() !== window.location.hash.split('#').pop()) {
      const clone = room.cloneNode(true)
      clone.classList.remove('room-tile', 'room-tile--main')
      if(clone.querySelector('img, svg'))
        clone.querySelector('img, svg').remove()
      clone.classList.add('room-shortcut')
      frag.append(clone)
    }
  })
  getRef('room_switcher').append(frag)
}

if (allRooms.length) {
  renderRoomShorcuts()
}

const heroTitleObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      getRef('room_title').animate(slideOutDown, animeInOptions)
      .onfinish = () => {
        getRef('room_title').classList.add('hide-completely')
      }
      // getRef('hero_title').animate(slideInDown, animeOutOption)
    }
    else {
        if (isRoomOpen)
      getRef('room_title').classList.remove('hide-completely')
      getRef('room_title').animate(slideInUp, animeInOptions)
      // getRef('hero_title').animate(slideOutDown, animeOutOption)
    }
  })
},
  {
  threshold: 1
  }
)

if (getRef('hero_title')) {
  heroTitleObserver.observe(getRef('hero_title'))
}



/*! Hammer.JS - v2.0.8 - 2016-04-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
!function(a,b,c,d){"use strict";function e(a,b,c){return setTimeout(j(a,c),b)}function f(a,b,c){return Array.isArray(a)?(g(a,c[b],c),!0):!1}function g(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function h(b,c,d){var e="DEPRECATED METHOD: "+c+"\n"+d+" AT \n";return function(){var c=new Error("get-stack-trace"),d=c&&c.stack?c.stack.replace(/^[^\(]+?[\n$]/gm,"").replace(/^\s+at\s+/gm,"").replace(/^Object.<anonymous>\s*\(/gm,"{anonymous}()@"):"Unknown Stack Trace",f=a.console&&(a.console.warn||a.console.log);return f&&f.call(a.console,e,d),b.apply(this,arguments)}}function i(a,b,c){var d,e=b.prototype;d=a.prototype=Object.create(e),d.constructor=a,d._super=e,c&&la(d,c)}function j(a,b){return function(){return a.apply(b,arguments)}}function k(a,b){return typeof a==oa?a.apply(b?b[0]||d:d,b):a}function l(a,b){return a===d?b:a}function m(a,b,c){g(q(b),function(b){a.addEventListener(b,c,!1)})}function n(a,b,c){g(q(b),function(b){a.removeEventListener(b,c,!1)})}function o(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function p(a,b){return a.indexOf(b)>-1}function q(a){return a.trim().split(/\s+/g)}function r(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function s(a){return Array.prototype.slice.call(a,0)}function t(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];r(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function u(a,b){for(var c,e,f=b[0].toUpperCase()+b.slice(1),g=0;g<ma.length;){if(c=ma[g],e=c?c+f:b,e in a)return e;g++}return d}function v(){return ua++}function w(b){var c=b.ownerDocument||b;return c.defaultView||c.parentWindow||a}function x(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){k(a.options.enable,[a])&&c.handler(b)},this.init()}function y(a){var b,c=a.options.inputClass;return new(b=c?c:xa?M:ya?P:wa?R:L)(a,z)}function z(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&Ea&&d-e===0,g=b&(Ga|Ha)&&d-e===0;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,A(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function A(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=D(b)),e>1&&!c.firstMultiple?c.firstMultiple=D(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=E(d);b.timeStamp=ra(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=I(h,i),b.distance=H(h,i),B(c,b),b.offsetDirection=G(b.deltaX,b.deltaY);var j=F(b.deltaTime,b.deltaX,b.deltaY);b.overallVelocityX=j.x,b.overallVelocityY=j.y,b.overallVelocity=qa(j.x)>qa(j.y)?j.x:j.y,b.scale=g?K(g.pointers,d):1,b.rotation=g?J(g.pointers,d):0,b.maxPointers=c.prevInput?b.pointers.length>c.prevInput.maxPointers?b.pointers.length:c.prevInput.maxPointers:b.pointers.length,C(c,b);var k=a.element;o(b.srcEvent.target,k)&&(k=b.srcEvent.target),b.target=k}function B(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};b.eventType!==Ea&&f.eventType!==Ga||(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function C(a,b){var c,e,f,g,h=a.lastInterval||b,i=b.timeStamp-h.timeStamp;if(b.eventType!=Ha&&(i>Da||h.velocity===d)){var j=b.deltaX-h.deltaX,k=b.deltaY-h.deltaY,l=F(i,j,k);e=l.x,f=l.y,c=qa(l.x)>qa(l.y)?l.x:l.y,g=G(j,k),a.lastInterval=b}else c=h.velocity,e=h.velocityX,f=h.velocityY,g=h.direction;b.velocity=c,b.velocityX=e,b.velocityY=f,b.direction=g}function D(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:pa(a.pointers[c].clientX),clientY:pa(a.pointers[c].clientY)},c++;return{timeStamp:ra(),pointers:b,center:E(b),deltaX:a.deltaX,deltaY:a.deltaY}}function E(a){var b=a.length;if(1===b)return{x:pa(a[0].clientX),y:pa(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:pa(c/b),y:pa(d/b)}}function F(a,b,c){return{x:b/a||0,y:c/a||0}}function G(a,b){return a===b?Ia:qa(a)>=qa(b)?0>a?Ja:Ka:0>b?La:Ma}function H(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function I(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function J(a,b){return I(b[1],b[0],Ra)+I(a[1],a[0],Ra)}function K(a,b){return H(b[0],b[1],Ra)/H(a[0],a[1],Ra)}function L(){this.evEl=Ta,this.evWin=Ua,this.pressed=!1,x.apply(this,arguments)}function M(){this.evEl=Xa,this.evWin=Ya,x.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function N(){this.evTarget=$a,this.evWin=_a,this.started=!1,x.apply(this,arguments)}function O(a,b){var c=s(a.touches),d=s(a.changedTouches);return b&(Ga|Ha)&&(c=t(c.concat(d),"identifier",!0)),[c,d]}function P(){this.evTarget=bb,this.targetIds={},x.apply(this,arguments)}function Q(a,b){var c=s(a.touches),d=this.targetIds;if(b&(Ea|Fa)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=s(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return o(a.target,i)}),b===Ea)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Ga|Ha)&&delete d[g[e].identifier],e++;return h.length?[t(f.concat(h),"identifier",!0),h]:void 0}function R(){x.apply(this,arguments);var a=j(this.handler,this);this.touch=new P(this.manager,a),this.mouse=new L(this.manager,a),this.primaryTouch=null,this.lastTouches=[]}function S(a,b){a&Ea?(this.primaryTouch=b.changedPointers[0].identifier,T.call(this,b)):a&(Ga|Ha)&&T.call(this,b)}function T(a){var b=a.changedPointers[0];if(b.identifier===this.primaryTouch){var c={x:b.clientX,y:b.clientY};this.lastTouches.push(c);var d=this.lastTouches,e=function(){var a=d.indexOf(c);a>-1&&d.splice(a,1)};setTimeout(e,cb)}}function U(a){for(var b=a.srcEvent.clientX,c=a.srcEvent.clientY,d=0;d<this.lastTouches.length;d++){var e=this.lastTouches[d],f=Math.abs(b-e.x),g=Math.abs(c-e.y);if(db>=f&&db>=g)return!0}return!1}function V(a,b){this.manager=a,this.set(b)}function W(a){if(p(a,jb))return jb;var b=p(a,kb),c=p(a,lb);return b&&c?jb:b||c?b?kb:lb:p(a,ib)?ib:hb}function X(){if(!fb)return!1;var b={},c=a.CSS&&a.CSS.supports;return["auto","manipulation","pan-y","pan-x","pan-x pan-y","none"].forEach(function(d){b[d]=c?a.CSS.supports("touch-action",d):!0}),b}function Y(a){this.options=la({},this.defaults,a||{}),this.id=v(),this.manager=null,this.options.enable=l(this.options.enable,!0),this.state=nb,this.simultaneous={},this.requireFail=[]}function Z(a){return a&sb?"cancel":a&qb?"end":a&pb?"move":a&ob?"start":""}function $(a){return a==Ma?"down":a==La?"up":a==Ja?"left":a==Ka?"right":""}function _(a,b){var c=b.manager;return c?c.get(a):a}function aa(){Y.apply(this,arguments)}function ba(){aa.apply(this,arguments),this.pX=null,this.pY=null}function ca(){aa.apply(this,arguments)}function da(){Y.apply(this,arguments),this._timer=null,this._input=null}function ea(){aa.apply(this,arguments)}function fa(){aa.apply(this,arguments)}function ga(){Y.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function ha(a,b){return b=b||{},b.recognizers=l(b.recognizers,ha.defaults.preset),new ia(a,b)}function ia(a,b){this.options=la({},ha.defaults,b||{}),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.oldCssProps={},this.element=a,this.input=y(this),this.touchAction=new V(this,this.options.touchAction),ja(this,!0),g(this.options.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function ja(a,b){var c=a.element;if(c.style){var d;g(a.options.cssProps,function(e,f){d=u(c.style,f),b?(a.oldCssProps[d]=c.style[d],c.style[d]=e):c.style[d]=a.oldCssProps[d]||""}),b||(a.oldCssProps={})}}function ka(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var la,ma=["","webkit","Moz","MS","ms","o"],na=b.createElement("div"),oa="function",pa=Math.round,qa=Math.abs,ra=Date.now;la="function"!=typeof Object.assign?function(a){if(a===d||null===a)throw new TypeError("Cannot convert undefined or null to object");for(var b=Object(a),c=1;c<arguments.length;c++){var e=arguments[c];if(e!==d&&null!==e)for(var f in e)e.hasOwnProperty(f)&&(b[f]=e[f])}return b}:Object.assign;var sa=h(function(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a},"extend","Use `assign`."),ta=h(function(a,b){return sa(a,b,!0)},"merge","Use `assign`."),ua=1,va=/mobile|tablet|ip(ad|hone|od)|android/i,wa="ontouchstart"in a,xa=u(a,"PointerEvent")!==d,ya=wa&&va.test(navigator.userAgent),za="touch",Aa="pen",Ba="mouse",Ca="kinect",Da=25,Ea=1,Fa=2,Ga=4,Ha=8,Ia=1,Ja=2,Ka=4,La=8,Ma=16,Na=Ja|Ka,Oa=La|Ma,Pa=Na|Oa,Qa=["x","y"],Ra=["clientX","clientY"];x.prototype={handler:function(){},init:function(){this.evEl&&m(this.element,this.evEl,this.domHandler),this.evTarget&&m(this.target,this.evTarget,this.domHandler),this.evWin&&m(w(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&n(this.element,this.evEl,this.domHandler),this.evTarget&&n(this.target,this.evTarget,this.domHandler),this.evWin&&n(w(this.element),this.evWin,this.domHandler)}};var Sa={mousedown:Ea,mousemove:Fa,mouseup:Ga},Ta="mousedown",Ua="mousemove mouseup";i(L,x,{handler:function(a){var b=Sa[a.type];b&Ea&&0===a.button&&(this.pressed=!0),b&Fa&&1!==a.which&&(b=Ga),this.pressed&&(b&Ga&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:Ba,srcEvent:a}))}});var Va={pointerdown:Ea,pointermove:Fa,pointerup:Ga,pointercancel:Ha,pointerout:Ha},Wa={2:za,3:Aa,4:Ba,5:Ca},Xa="pointerdown",Ya="pointermove pointerup pointercancel";a.MSPointerEvent&&!a.PointerEvent&&(Xa="MSPointerDown",Ya="MSPointerMove MSPointerUp MSPointerCancel"),i(M,x,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=Va[d],f=Wa[a.pointerType]||a.pointerType,g=f==za,h=r(b,a.pointerId,"pointerId");e&Ea&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Ga|Ha)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var Za={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},$a="touchstart",_a="touchstart touchmove touchend touchcancel";i(N,x,{handler:function(a){var b=Za[a.type];if(b===Ea&&(this.started=!0),this.started){var c=O.call(this,a,b);b&(Ga|Ha)&&c[0].length-c[1].length===0&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}}});var ab={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},bb="touchstart touchmove touchend touchcancel";i(P,x,{handler:function(a){var b=ab[a.type],c=Q.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}});var cb=2500,db=25;i(R,x,{handler:function(a,b,c){var d=c.pointerType==za,e=c.pointerType==Ba;if(!(e&&c.sourceCapabilities&&c.sourceCapabilities.firesTouchEvents)){if(d)S.call(this,b,c);else if(e&&U.call(this,c))return;this.callback(a,b,c)}},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var eb=u(na.style,"touchAction"),fb=eb!==d,gb="compute",hb="auto",ib="manipulation",jb="none",kb="pan-x",lb="pan-y",mb=X();V.prototype={set:function(a){a==gb&&(a=this.compute()),fb&&this.manager.element.style&&mb[a]&&(this.manager.element.style[eb]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return g(this.manager.recognizers,function(b){k(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),W(a.join(" "))},preventDefaults:function(a){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return void b.preventDefault();var d=this.actions,e=p(d,jb)&&!mb[jb],f=p(d,lb)&&!mb[lb],g=p(d,kb)&&!mb[kb];if(e){var h=1===a.pointers.length,i=a.distance<2,j=a.deltaTime<250;if(h&&i&&j)return}return g&&f?void 0:e||f&&c&Na||g&&c&Oa?this.preventSrc(b):void 0},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var nb=1,ob=2,pb=4,qb=8,rb=qb,sb=16,tb=32;Y.prototype={defaults:{},set:function(a){return la(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(f(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=_(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return f(a,"dropRecognizeWith",this)?this:(a=_(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(f(a,"requireFailure",this))return this;var b=this.requireFail;return a=_(a,this),-1===r(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(f(a,"dropRequireFailure",this))return this;a=_(a,this);var b=r(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function b(b){c.manager.emit(b,a)}var c=this,d=this.state;qb>d&&b(c.options.event+Z(d)),b(c.options.event),a.additionalEvent&&b(a.additionalEvent),d>=qb&&b(c.options.event+Z(d))},tryEmit:function(a){return this.canEmit()?this.emit(a):void(this.state=tb)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(tb|nb)))return!1;a++}return!0},recognize:function(a){var b=la({},a);return k(this.options.enable,[this,b])?(this.state&(rb|sb|tb)&&(this.state=nb),this.state=this.process(b),void(this.state&(ob|pb|qb|sb)&&this.tryEmit(b))):(this.reset(),void(this.state=tb))},process:function(a){},getTouchAction:function(){},reset:function(){}},i(aa,Y,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(ob|pb),e=this.attrTest(a);return d&&(c&Ha||!e)?b|sb:d||e?c&Ga?b|qb:b&ob?b|pb:ob:tb}}),i(ba,aa,{defaults:{event:"pan",threshold:10,pointers:1,direction:Pa},getTouchAction:function(){var a=this.options.direction,b=[];return a&Na&&b.push(lb),a&Oa&&b.push(kb),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&Na?(e=0===f?Ia:0>f?Ja:Ka,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?Ia:0>g?La:Ma,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return aa.prototype.attrTest.call(this,a)&&(this.state&ob||!(this.state&ob)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=$(a.direction);b&&(a.additionalEvent=this.options.event+b),this._super.emit.call(this,a)}}),i(ca,aa,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&ob)},emit:function(a){if(1!==a.scale){var b=a.scale<1?"in":"out";a.additionalEvent=this.options.event+b}this._super.emit.call(this,a)}}),i(da,Y,{defaults:{event:"press",pointers:1,time:251,threshold:9},getTouchAction:function(){return[hb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Ga|Ha)&&!f)this.reset();else if(a.eventType&Ea)this.reset(),this._timer=e(function(){this.state=rb,this.tryEmit()},b.time,this);else if(a.eventType&Ga)return rb;return tb},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===rb&&(a&&a.eventType&Ga?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=ra(),this.manager.emit(this.options.event,this._input)))}}),i(ea,aa,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&ob)}}),i(fa,aa,{defaults:{event:"swipe",threshold:10,velocity:.3,direction:Na|Oa,pointers:1},getTouchAction:function(){return ba.prototype.getTouchAction.call(this)},attrTest:function(a){var b,c=this.options.direction;return c&(Na|Oa)?b=a.overallVelocity:c&Na?b=a.overallVelocityX:c&Oa&&(b=a.overallVelocityY),this._super.attrTest.call(this,a)&&c&a.offsetDirection&&a.distance>this.options.threshold&&a.maxPointers==this.options.pointers&&qa(b)>this.options.velocity&&a.eventType&Ga},emit:function(a){var b=$(a.offsetDirection);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),i(ga,Y,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10},getTouchAction:function(){return[ib]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime<b.time;if(this.reset(),a.eventType&Ea&&0===this.count)return this.failTimeout();if(d&&f&&c){if(a.eventType!=Ga)return this.failTimeout();var g=this.pTime?a.timeStamp-this.pTime<b.interval:!0,h=!this.pCenter||H(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,h&&g?this.count+=1:this.count=1,this._input=a;var i=this.count%b.taps;if(0===i)return this.hasRequireFailures()?(this._timer=e(function(){this.state=rb,this.tryEmit()},b.interval,this),ob):rb}return tb},failTimeout:function(){return this._timer=e(function(){this.state=tb},this.options.interval,this),tb},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==rb&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),ha.VERSION="2.0.8",ha.defaults={domEvents:!1,touchAction:gb,enable:!0,inputTarget:null,inputClass:null,preset:[[ea,{enable:!1}],[ca,{enable:!1},["rotate"]],[fa,{direction:Na}],[ba,{direction:Na},["swipe"]],[ga],[ga,{event:"doubletap",taps:2},["tap"]],[da]],cssProps:{userSelect:"none",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var ub=1,vb=2;ia.prototype={set:function(a){return la(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?vb:ub},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&rb)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===vb||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(ob|pb|qb)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof Y)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(f(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(f(a,"remove",this))return this;if(a=this.get(a)){var b=this.recognizers,c=r(b,a);-1!==c&&(b.splice(c,1),this.touchAction.update())}return this},on:function(a,b){if(a!==d&&b!==d){var c=this.handlers;return g(q(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this}},off:function(a,b){if(a!==d){var c=this.handlers;return g(q(a),function(a){b?c[a]&&c[a].splice(r(c[a],b),1):delete c[a]}),this}},emit:function(a,b){this.options.domEvents&&ka(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&ja(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},la(ha,{INPUT_START:Ea,INPUT_MOVE:Fa,INPUT_END:Ga,INPUT_CANCEL:Ha,STATE_POSSIBLE:nb,STATE_BEGAN:ob,STATE_CHANGED:pb,STATE_ENDED:qb,STATE_RECOGNIZED:rb,STATE_CANCELLED:sb,STATE_FAILED:tb,DIRECTION_NONE:Ia,DIRECTION_LEFT:Ja,DIRECTION_RIGHT:Ka,DIRECTION_UP:La,DIRECTION_DOWN:Ma,DIRECTION_HORIZONTAL:Na,DIRECTION_VERTICAL:Oa,DIRECTION_ALL:Pa,Manager:ia,Input:x,TouchAction:V,TouchInput:P,MouseInput:L,PointerEventInput:M,TouchMouseInput:R,SingleTouchInput:N,Recognizer:Y,AttrRecognizer:aa,Tap:ga,Pan:ba,Swipe:fa,Pinch:ca,Rotate:ea,Press:da,on:m,off:n,each:g,merge:ta,extend:sa,assign:la,inherit:i,bindFn:j,prefixed:u});var wb="undefined"!=typeof a?a:"undefined"!=typeof self?self:{};wb.Hammer=ha,"function"==typeof define&&define.amd?define(function(){return ha}):"undefined"!=typeof module&&module.exports?module.exports=ha:a[c]=ha}(window,document,"Hammer");
//# sourceMappingURL=hammer.min.js.map

const roomContainer = document.querySelector('.room-container')

if (roomContainer) {
  const hammertime = new Hammer(roomContainer);
  hammertime.on('swipe', (e) => {
    if (e.direction === 2 && getRef(currentRoomId).nextElementSibling) {
      roomContainer.querySelector(`[href="#${getRef(currentRoomId).nextElementSibling.id}"]`).click()
    }
    else if (e.direction === 4 && getRef(currentRoomId).previousElementSibling) {
      roomContainer.querySelector(`[href="#${getRef(currentRoomId).previousElementSibling.id}"]`).click()
    }
  })
}
