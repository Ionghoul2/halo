# Halo — B2B supply portal

A gated wholesale ordering portal for suppliers who sell to licensed facilities
(compounding pharmacies, outsourcing facilities, analytical labs, contract
manufacturers).

The problem it solves: a supplier with real product and real buyers is running
orders through WhatsApp threads and a PDF price list. Their buyer is a pharmacy
whose purchasing records have to survive a board inspection. The supplier looks
unserious, and the buyer can't justify the purchase internally. This portal is
the thing that makes the supplier look like a vendor instead of a contact.

## What's here

- `portal/index.html` — the working demo. Single file, no build step, no
  dependencies. Open it in a browser.
- `docs/SALES.md` — pricing, the pitch, and the client intake checklist.

## The demo

Three perspectives, switchable from the bar at the top of the page:

| Perspective | What it shows |
|---|---|
| **Visitor** | Public site. Catalogue visible, pricing locked. Account application form. |
| **Approved buyer** | Pricing released with quantity breaks, quote builder, account record, COA library, invoice. |
| **Supplier admin** | Application review queue with approve/decline, open quote requests, invoiced totals. |

Everything is clickable. Approving an application in the admin view, adding
material to a request, submitting the application form — all of it responds.

The demo supplier (Northbank Fine Chemicals) is fictional and the catalogue is
sample excipients and actives. Swap both for a real client.

## Design decisions worth keeping

**Pricing is gated, not public.** This is how wholesale actually works and it's
also the feature that justifies the price of the build — it turns the site from
a brochure into a system that qualifies buyers.

**Quote-to-PO, not a cart.** Wholesale buyers don't check out. They request a
quote, get firm pricing and lead times, then send a purchase order against it.
The flow mirrors that.

**ACH and wire only.** No card, no payment app, no peer-to-peer. A licensed
facility needs an auditable trail from PO to invoice to payment, and those
methods don't produce one. Any supplier who pushes back on this is telling you
something about their buyers.

**Verification is a form with real fields.** State board licence number, DEA
registration where the material requires it, FDA establishment identifier for
503B facilities, facility shipping address. A checkbox that says "I am a
professional" is not verification and no compliance officer treats it as one.

## Swapping in a client

1. Replace the `CATALOG` array in `portal/index.html`.
2. Replace `ACCOUNT`, `APPLICATIONS` and `QUOTES` seed data with their real records.
3. Update the brand block in the header and the footer text.
4. Update the remittance details in `viewInvoice()`.
5. Retheme via the `:root` custom properties at the top of the `<style>` block.

For a paying client this becomes a real app with a database and auth. The
single file is the sales asset — it exists so a prospect can click through the
whole thing in two minutes without you provisioning anything.
