impo * Il n'impose aucun style ; les classes CSS peuvent être passées
 * via la prop `className` depuis les pages consommatrices. * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

/**
 * Ce fichier réexporte les composants Collapsible de Radix UI.
 * Il n’impose aucun style ; les classes CSS peuvent être passées
 * via la prop `className` depuis les pages consommatrices.
 */

export const Collapsible = CollapsiblePrimitive.Root;

/**
 * Déclenche l’ouverture/fermeture de la section.
 */
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

/**
 * Contenu affiché lorsque le collapsible est ouvert.
 */
export const CollapsibleContent = CollapsiblePrimitive.Content;
