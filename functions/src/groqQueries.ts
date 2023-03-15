const HOMEPAGE = `
          title,
          isUnderConstruction,
          releaseDate,
          slug,
          address,
          email,
          phone,
          description,
          metaImage,
          pageContent,
          underConstructionPageRef,
          structuredData,
          facebook,
          facebookIconSrc{
            asset->{
              _id,
              url,
              altText
             }
          },
          twitter,
          twitterIconSrc{
            asset->{
              _id,
              url,
              altText
             }
          },
          instagram,
          instagramIconSrc{
            asset->{
              _id,
              url,
              altText
             }
          }
`
//
// const INGREDIENT = `
//           title,
//           slug,
//           product,
//           isLiquor,
//           isJuice,
//           isCordial,
// `
const INSTRUCTiON = `
          title,
          slug,
          tool,
          action,
          instruction,
          "mixingGlassGarnishes":mixingGlass[]->,
          "mixingGlass":mixingGlass[]{
                _type,
                amount,
                ingredient->  
          },
`
const COCKTAIL = `
          _id,
          title,
          slug,
          description,
          imageSrc,
          glass->,
          "glassPrep": glassPrep[],
          "garnish": garnish[]->,
          "mixingGlassGarnishes": mixingGlass[]->,
          "mixingGlass": mixingGlass[]{
                _type,
                amount,
                ingredient->  
          },
          "instructions": instructions[]->{
            ${INSTRUCTiON}
          },
          drinkCount,
          isOnMenu
`
const INGREDIENT = `
          ...,
          liquorType->,
`
const LIQUOR_TYPE = `
          ...,
          imageSrc {
            asset->{
              _id,
              url,
              altText
             }
          },
`
// const MENUGROUP = `
//           title,
//           slug,
//           logoImage,
//           menuGroupTitle,
//           "links": links[]->{title, displayText, url, isOutlinedButton, isContainedButton}
// `

const MENUGROUP = `
          title,
          _type,
          slug,
          menuGroupTitle,
          "links":links[]->{
            _type,
            displayText,
            url,
            isOutlinedButton,
            isContainedButton,
          },
          displayText,
          url,
          isOutlinedButton,
          isContainedButton,
`

const MENUGROUPCONTAINER = `
          title,
          slug,
          displayText,
          "subMenus":subMenus[]->{
            ${MENUGROUP}
          },
          logoImageSrc,
          logoImageAltText
`


const defaultObj = {COCKTAIL, HOMEPAGE, MENUGROUPCONTAINER, MENUGROUP, INGREDIENT, LIQUOR_TYPE}


export default defaultObj