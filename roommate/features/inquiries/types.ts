export interface CreateInquiryInput {
  listingId: number;
  message: string;
}

export interface ReceivedInquiry {
  id: number;
  message: string;
  status: string;
  createdAt: Date;
  listing: {
    id: number;
    title: string;
  };
  sender: {
    id: number;
    name: string;
    email: string;
  };
}
