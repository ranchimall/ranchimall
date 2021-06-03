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
  } else {
    daylight();
    themeSwitcher.checked = false;
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
      if (year == currentYear) {
        if (currentTime[1] === month) {
          const dateDiff = parseInt(currentTime[2]) - parseInt(date);
          if (dateDiff === 0) return `${finalHours}`;
          else if (dateDiff === 1) return `Yesterday`;
          else if (dateDiff > 1 && dateDiff < 8) return currentTime[0];
          else return ` ${date} ${month}`;
        } else return ` ${date} ${month}`;
      } else return `${month} ${year}`;
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
`

const bobsFundRowTemplate = document.createElement('template')
bobsFundRowTemplate.innerHTML = `
<div class="bob-fund__row grid">
    <div class="grid">
        <h3 class="value person__name"></h3>
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
    const { investorName, invested, currentValue, timeElapsed, gain } = obj;
    const row = bobsFundRowTemplate.content.cloneNode(true);
    row.querySelector(".person__name").textContent = investorName;
    row.querySelector(".original-value").textContent = `${invested.toLocaleString(`en-US`, { style: 'currency', currency: 'INR' })}`;
    row.querySelector(".current-value").textContent = `${currentValue.toLocaleString(`en-US`, { style: 'currency', currency: 'INR' })}`;
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
  getRef("outlet_switcher").classList.remove("hide");
  getRef("outlet_switcher").animate(slideInDown, {
    duration: 300,
    easing: easeOutOvershoot,
    fill: "forwards",
  });
}

function hideOutletSwitcher() {
  if (!isOutletSwitcherOpen) return;
  getRef("outlet_switcher").animate(slideOutUp, {
    duration: 200,
    easing: easeInOvershoot,
    fill: "forwards",
  }).onfinish = () => {
    getRef("outlet_switcher").classList.add("hide");
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
  document.querySelector('.outlet-label__name').textContent = floorNum > -1 ? `Floor ${floorNum + 1} outlet ${outletNum + 1}` : ''
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


let tile, tileParent, tileDimensions, tileParentDimensions
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