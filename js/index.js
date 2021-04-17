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
      hideSiteMap();
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, sm-button:not([disable]), .interact")) {
      createRipple(e, e.target.closest("button, sm-button, .interact"));
    }
  });
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
    outlets: [
      {
        name: "Bitcoin Bonds",
        url: "bitcoinbonds",
      },
      {
        name: `Bob's Fund`,
        url: `bob'sfund`,
      },
      {
        name: "ICO",
        url: "ico",
      },
    ],
  },
  {
    floor: "Blockchain Contracts",
    outlets: [
      {
        name: "Incorporation Blockchain Contract",
        url: "incorporationblockchaincontract",
      },
      {
        name: `Internship Blockchain Contract`,
        url: `internshipblockchaincontract`,
      },
      {
        name: "FLO Blockchain Contract",
        url: "floblockchaincontract",
      },
      {
        name: "Startup Blockchain Contract",
        url: "startupblockchaincontract",
      },
      {
        name: "Real Estate Blockchain Contract",
        url: "realestateblockchaincontract",
      },
      {
        name: "Painting Blockchain Contract",
        url: "paintingblockchaincontract",
      },
    ],
  },
  {
    floor: 'Blockchain Apps',
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
  },
];

// templates

const floorListitemTemplate = document.createElement('template')
floorListitemTemplate.innerHTML = `
<li class="floor_list__item">
  <button class="floor_list__header floor__button">
      <h5 class="h5 floor-num">Floor</h5>
      <h4 class="h3"></h4>
  </button>
  <ul class="outlet-list grid"></ul>
</li>
`

const outletListitemTemplate = document.createElement('template')
outletListitemTemplate.innerHTML = `
  <li class="outlet-list__item interact">
    <a>
      <h4 class="outlet-title"></h4>
      <p class="outlet-brief"></p>
    </a>
  </li>
`




const render = {
  bitBondRow(obj) {
    const { series, currentValue, timeElapsed } = obj;
    const row = getRef("bit_bond_row").content.cloneNode(true);
    row.querySelector(".original-value").textContent = series;
    row.querySelector(".current-value").textContent = currentValue;
    row.querySelector(".time-elapsed").textContent = timeElapsed;
    return row;
  },
  bobFundRow(obj) {
    const { investorName, invested, currentValue, timeElapsed } = obj;
    const row = getRef("bob_fund_row").content.cloneNode(true);
    row.querySelector(".investor__name").textContent = investorName;
    row.querySelector(".original-value").textContent = invested;
    row.querySelector(".current-value").textContent = currentValue;
    row.querySelector(".time-elapsed").textContent = timeElapsed;
    return row;
  },
  icoInvestorRow(obj, options) {
    const { extension, investorName, bio, contribution } = obj;
    const { thumbnail } = options;
    const row = getRef("ico_investor_row").content.cloneNode(true);
    const card = row.querySelector(".investor-card");
    const folder = thumbnail ? "investors-thumbnail" : "investors";
    const investorImage = row.querySelector(".investor__image");
    if (thumbnail) card.classList.add("investor-card--small");
    else card.classList.add("investor-card--big");
    investorImage.src = `assets/${folder}/${investorName}.${extension}`;
    investorImage.setAttribute("alt", `${investorName} profile picture`);
    row.querySelector(".investor__name").textContent = investorName;
    row.querySelector(".investor__bio").textContent = bio;
    row.querySelector(".investor__contribution").textContent = contribution;
    return row;
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
    // floorLabel.querySelector('.floor-num').textContent = `Floor ${floorNumber}`
    // floorLabel.querySelector('.floor-name').textContent = floors[floorNumber - 1]
    return floorLabel;
  },
  outletListItem(outletObj) {
    const { name, brief, url} = outletObj
    const li = outletListitemTemplate.content.cloneNode(true).firstElementChild
    li.querySelector('a').href = `${url}.html`
    li.querySelector('.outlet-title').textContent = name
    li.querySelector('.outlet-brief').textContent = brief ? brief: ''
    return li
  },
  floorListitem(floorObj, index) {
    const { floor, outlets} = floorObj
    const li = floorListitemTemplate.content.cloneNode(true).firstElementChild
    li.firstElementChild.dataset.target = `floor_${index + 1}`;
    li.querySelector('.h3').textContent = floor
    li.querySelector('.h5').textContent = `floor ${index + 1}`

    const frag = document.createDocumentFragment()
    outlets.forEach(outlet => frag.append(render.outletListItem(outlet)))

    li.querySelector('.outlet-list').append(frag)
    return li
  },
  outletSwitcherButton(outletObj, activeOutlet) {
    const { name, url} = outletObj
    const button = document.createElement('a')
    button.classList.add('outlet_switcher__button')
    if (activeOutlet === url) {
      button.classList.add('outlet_switcher__button--active')
    }
    button.href = url
    button.textContent = name
    return button;
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
  if(e.target.closest('.floor-label, .floor__button')){
    const label = e.target.closest('.floor-label, .floor__button')
    const target = label.dataset.target
    window.open(`index.html#${target}`, '_self')
    if(isSiteMapOpen){
        hideSiteMap()
    }
  }
})

const outletObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // if(window.innerWidth < 640){
      if (entry.isIntersecting) {
        entry.target.querySelector("sm-carousel").startAutoPlay();
      } else {
        entry.target.querySelector("sm-carousel").stopAutoPlay();
      }
      // }
    });
  },
  {
    threshold: 1,
  }
);

document
  .querySelectorAll(".carousel-container")
  .forEach((outlet) => outletObserver.observe(outlet));

let isOutletSwitcherOpen = false;
document.addEventListener("click", (e) => {
  if (isOutletSwitcherOpen) {
    hideOutletSwitcher();
  } else {
    if (e.target.closest(".outlet-label")) {
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
      if (pathArray[pathArray.length - 1].indexOf(outlet.url) > -1) {
        renderFloorOutlets(floor, outlet.url)
        break;
      }
    }
  }
}
renderSiteMap()

function renderFloorOutlets(floorObj, activeOutlet) {
  const { floor, outlets } = floorObj
  const frag = document.createDocumentFragment()
  outlets.forEach(outlet => frag.append(render.outletSwitcherButton(outlet, activeOutlet)))
  getRef('outlet_switcher__outlet_container').append(frag)
  getRef('outlet_switcher__floor_num').textContent = floor
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
  .from("#elevator_popup", { duration: 0.3, opacity: 0, y: 16 })
  .from(".floor_list__item", { opacity: 0, y: 16});


  
function showSiteMap() {
  document.querySelectorAll(".page").forEach((page) => {
    page.setAttribute("aria-hidden", "true");
  });
  isSiteMapOpen = true;
  document.body.style.overflow = "hidden";
  document.body.style.top = `-${window.scrollY}px`;
  getRef("elevator_popup").classList.remove("hide-completely");
  siteMapTimeline.duration(0.6).play();
}

function hideSiteMap() {
  const scrollY = document.body.style.top;
  window.scrollTo(0, parseInt(scrollY || "0") * -1);
  siteMapTimeline.duration(0.3).reverse();
  document.querySelectorAll(".page").forEach((page) => {
    page.removeAttribute("aria-hidden");
  });
}

function resumeScrolling() {
  document.body.style.overflow = "auto";
  document.body.style.top = "initial";
  isSiteMapOpen = false;
  getRef("elevator_popup").classList.add("hide-completely");
}

