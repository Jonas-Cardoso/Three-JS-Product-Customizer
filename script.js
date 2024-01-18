import EmblaCarousel from "embla-carousel";

const productSlides = document.querySelector(".product-images");
const experienceControls = document.getElementById("experience_controls");
const imageControls = document.getElementById("image_controls");
const prevButtonNode = productSlides.querySelector(".embla__prev");
const nextButtonNode = productSlides.querySelector(".embla__next");
const productSlidesViewportNode =
  productSlides.querySelector(".embla__viewport");
const productSlidesEmbla = EmblaCarousel(productSlidesViewportNode, {
  watchDrag: false,
});

prevButtonNode.addEventListener("click", productSlidesEmbla.scrollPrev, false);
nextButtonNode.addEventListener("click", productSlidesEmbla.scrollNext, false);

productSlidesEmbla.on("select", () => {
  const selectedIndex = productSlidesEmbla.selectedScrollSnap();
  const totalSlides = productSlidesEmbla.slideNodes().length;
  const isExperienceSlide =
    productSlidesEmbla.slideNodes()[selectedIndex].id === "experience";

  if (isExperienceSlide) {
    imageControls.style.display = "none";
    experienceControls.style.display = "flex";
  } else {
    imageControls.style.display = "flex";
    experienceControls.style.display = "none";
  }

  prevButtonNode.style.visibility = selectedIndex === 0 ? "hidden" : "visible";
  nextButtonNode.style.visibility =
    selectedIndex === totalSlides - 1 ? "hidden" : "visible";
});

const relatedSlides = document.querySelector(".related-products");
const relatedSlidesEmbla = EmblaCarousel(relatedSlides);
