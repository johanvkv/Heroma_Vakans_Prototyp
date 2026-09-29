import React from 'react';
import Gallery from 'devextreme-react/gallery';
import exampleImage from '../../assets/4037830dd23137a08b4f806eb50400b61146b95f.png';

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  link?: {
    text: string;
    url: string;
  };
  image: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: 'Figma Make Heroma Template',
    description: 'Templaten innehåller Heromas komponentdesign avseende header, karusell, cards, knappar, tabeller, accordions, inputfält med fler och kommer utökas kontinuerligt. Vill du påbörja en ny design promptar du enbart att ta bort all content under headern varav du då får en tom rityta men med bibehållen header.',
    link: {
      text: 'HR självhjälp',
      url: '#'
    },
    image: exampleImage
  },
  {
    id: 2,
    title: 'Vi förbättrar Heroma i Figma Make',
    description: 'Målet är att Figma Make ska kunna leda oss rätt redan vid första prompten – förstå hur vi bygger effektiva flöden och hur vi skapar en tydlig röd tråd genom hela Heromas applikationslandskap. För att nå dit behöver vi fortsätta träna och instruera Make i Heromas unika förutsättningar, principer och arbetssätt. Har du förslag på förbättringar som kan effektivisera Heromas mall i Make så vill vi gärna höra, smått som stort.',
    link: {
      text: 'HR självhjälp',
      url: '#'
    },
    image: exampleImage
  }
];

const renderSlide = (item: CarouselSlide) => {
  return (
    <div className="position-relative bg-white rounded-0 overflow-hidden d-flex flex-column-reverse flex-md-row">
      <div className="carousel-text-area">
        <div>
          {/* Information Banner */}
          <div className="info-banner carousel-banner">
            <i className="fa-solid fa-circle-info"></i>
            <span className="info-banner-text">Information</span>
          </div>
          
          <h3 className="carousel-title">{item.title}</h3>
          <p className="text-foreground text-opacity-80 small mb-4 banner-text text-wrap">
            {item.description}
          </p>
          {item.link && (
            null
          )}
        </div>
      </div>
      <div className="carousel-image-area">
        <img 
          src={item.image} 
          alt="Carousel slide" 
          className="w-100 h-100 object-fit-cover"
        />
      </div>
    </div>
  );
};

export const Carousel = () => {
  const galleryRef = React.useRef<any>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handlePrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : slides.length - 1;
    setSelectedIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedIndex < slides.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
  };

  const handleSelectionChanged = (e: any) => {
    if (e.component) {
      const newIndex = e.component.option('selectedIndex');
      setSelectedIndex(newIndex);
    }
  };

  return (
    <div className="carousel-wrapper position-relative">
      <Gallery
        ref={galleryRef}
        dataSource={slides}
        height="auto"
        slideshowDelay={30000}
        loop={true}
        showNavButtons={false}
        showIndicator={false}
        itemRender={renderSlide}
        onSelectionChanged={handleSelectionChanged}
        selectedIndex={selectedIndex}
      />
      <div className="carousel-controls">
        <button 
          onClick={handlePrevious}
          className="carousel-nav-btn carousel-nav-prev"
          aria-label="Previous slide"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="carousel-indicators-spacer">
          {slides.map((slide, index) => (
            <span
              key={slide.id}
              className={`carousel-dot ${index === selectedIndex ? 'active' : ''}`}
            />
          ))}
        </div>
        <button 
          onClick={handleNext}
          className="carousel-nav-btn carousel-nav-next"
          aria-label="Next slide"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};
