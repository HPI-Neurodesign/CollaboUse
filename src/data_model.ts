export interface CollaboUseResult {
  prompt: string;
  availableItems: string[];
  suggestions: CollaboUseSuggestion[];
  id: string;
}
export interface CollaboUseSuggestion {
  title: string;
  items: CollaboUseSuggestionItem[];
  addedBy: string | null;
  id: string;
  selectedBy: string[];
}
export interface CollaboUseSuggestionItem {
  item: string;
  addedBy: string | null;
  id: string;
}
